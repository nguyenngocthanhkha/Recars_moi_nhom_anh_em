import { randomUUID } from 'node:crypto';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import Driver from '../models/Driver.js';
import Payment from '../models/Payment.js';
import { syncBookingPayments } from './paymentSync.js';
import { fail } from '../utils/http.js';
import { text } from '../validators/input.js';

const DAY = 86400000;
export const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });

// Kiểm tra ngày thật và quy đổi sang ngày UTC để tính tiền không lệch múi giờ.
export function rentalDates(start, end) {
  for (const date of [start, end]) {
    if (
      typeof date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date
    )
      fail(400, 'Ngày thuê không hợp lệ.');
  }
  const days = (Date.parse(end) - Date.parse(start)) / DAY;
  if (start < today() || !Number.isInteger(days) || days < 1 || days > 365)
    fail(400, 'Ngày trả phải sau ngày nhận; thời gian thuê từ 1 đến 365 ngày và không ở quá khứ.');
  return {
    days,
    slots: Array.from({ length: days }, (_, i) =>
      new Date(Date.parse(start) + i * DAY).toISOString().slice(0, 10),
    ),
  };
}
export function calculateCost(price, days, mode) {
  const rental = price * days;
  const driverFee = mode === 'driver' ? 500000 * days : 0;
  const total = rental + driverFee;
  const rate = mode === 'driver' ? 0.2 : 0.3;
  const deposit = Math.round(total * rate);
  return { days, price, rental, driverFee, total, rate, deposit, remaining: total - deposit };
}

// Job và API cùng dùng một lệnh giải phóng đơn quá hạn, không xóa lịch sử.
export async function expirePendingBookings() {
  return Booking.updateMany(
    { status: 'pending', expiresAt: { $lte: new Date() } },
    { $set: { status: 'expired', holding: false, slots: [] } },
  );
}
export async function createBooking(body, user) {
  await expirePendingBookings();
  const carId = text(body, 'carId');
  const car = await Car.findOne({ _id: carId, active: true });
  if (!car) fail(404, 'Xe không còn khả dụng.');
  const mode = text(body, 'mode');
  if (!car.modes.includes(mode)) fail(400, 'Xe không hỗ trợ hình thức thuê này.');
  const start = text(body, 'start'),
    end = text(body, 'end');
  const { days, slots } = rentalDates(start, end);
  // Unique index kiểm tra xung đột khi ghi, kể cả hai request chạy đồng thời.
  return Booking.create({
    _id: `RC-${randomUUID().slice(0, 8).toUpperCase()}`,
    userId: user.id,
    carId,
    carName: car.name,
    carImage: car.image,
    mode,
    start,
    end,
    slots,
    holding: true,
    ...calculateCost(car.price, days, mode),
    name: text(body, 'name', 2, 80),
    phone: text(body, 'phone'),
    location: text(body, 'location'),
    dropoff: text(body, 'dropoff'),
    note: typeof body.note === 'string' ? body.note.slice(0, 1000) : '',
    expiresAt: new Date(Date.now() + 3 * DAY),
  });
}

// Luôn xét chủ sở hữu trên server, không tin userId do frontend truyền lên.
export async function findAccessibleBooking(id, user) {
  await expirePendingBookings();
  const order = await Booking.findOne({
    _id: id,
    ...(user.role === 'admin' ? {} : { userId: user.id }),
  });
  if (!order) fail(404, 'Không tìm thấy đơn thuê.');
  return order;
}
export async function updateBooking(id, body, user) {
  const order = await findAccessibleBooking(id, user);
  const condition = { _id: id, status: order.status };
  let patch;
  if (body.status === 'cancelled') {
    const allowed = user.role === 'admin' ? ['pending', 'paid', 'confirmed'] : ['pending', 'paid'];
    if (!allowed.includes(order.status)) fail(409, 'Đơn không thể hủy ở trạng thái này.');
    patch = {
      status: 'cancelled', holding: false, slots: [],
      refundRequired: order.refundRequired || order.depositPaid,
      paymentsSynced: false,
    };
  } else {
    if (user.role !== 'admin') fail(403, 'Chỉ Admin được thay đổi trạng thái đơn.');
    if (Object.hasOwn(body, 'driverId')) {
      if (
        order.mode !== 'driver' ||
        !order.depositPaid ||
        !['paid', 'confirmed'].includes(order.status)
      )
        fail(409, 'Chỉ phân công cho đơn có tài xế đã cọc và chưa khởi hành.');
      const driverId = body.driverId || null;
      if (
        driverId &&
        (typeof driverId !== 'string' || !(await Driver.exists({ _id: driverId, active: true })))
      )
        fail(400, 'Tài xế không khả dụng.');
      patch = { driverId }; // Unique driver/day index chặn xung đột lịch phân công.
    } else if (body.balancePaid === true) {
      if (!order.depositPaid || !['confirmed', 'renting', 'completed'].includes(order.status))
        fail(409, 'Chưa thể ghi nhận tiền còn lại.');
      patch = { balancePaid: true };
    } else {
      const next = { paid: 'confirmed', confirmed: 'renting', renting: 'completed' }[order.status];
      if (!next || body.status !== next) fail(409, 'Chuyển trạng thái đơn không hợp lệ.');
      if (!order.depositPaid) fail(409, 'Đơn chưa thanh toán tiền cọc.');
      if (next === 'renting' && order.mode === 'driver' && !order.driverId)
        fail(409, 'Cần phân công tài xế trước khi bàn giao.');
      // Kiểm tra tài xế ngay trong lệnh ghi để chặn Admin khác vừa gỡ phân công.
      if (next === 'renting' && order.mode === 'driver') condition.driverId = order.driverId;
      patch = { status: next, ...(next === 'completed' ? { holding: false, slots: [] } : {}) };
    }
  }
  const updated = await Booking.findOneAndUpdate(
    condition,
    { $set: patch, ...(patch.paymentsSynced === false ? { $inc: { paymentRevision: 1 } } : {}) },
    { returnDocument: 'after', runValidators: true },
  );
  if (!updated) fail(409, 'Đơn vừa thay đổi. Vui lòng tải lại.');
  if (updated.status === 'cancelled' && updated.refundRequired)
    await Payment.updateMany({ bookingId: id, status: 'succeeded' }, { refundRequired: true });
  if (patch.paymentsSynced === false) await syncBookingPayments(id);
  return updated;
}
