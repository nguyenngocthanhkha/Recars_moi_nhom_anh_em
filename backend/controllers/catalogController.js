import Car from '../models/Car.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import { expirePendingBookings, rentalDates } from '../services/bookingService.js';
import { fail, send } from '../utils/http.js';
import { fields, text } from '../validators/input.js';
import { sendContactEmail } from '../services/mail.js';

// Public chỉ nhận xe/đánh giá hiển thị; đơn và khách hàng được lọc theo phiên.
export async function bootstrap(req, res) {
  await expirePendingBookings();
  const admin = req.user?.role === 'admin';
  const [cars, reviews, bookings, drivers, users, availability, payments] = await Promise.all([
    Car.find(admin ? {} : { active: true }).sort({ createdAt: 1 }),
    Review.find(
      admin
        ? {}
        : req.user
          ? { $or: [{ visible: true }, { userId: req.user.id }] }
          : { visible: true },
    ).sort({ createdAt: -1 }),
    req.user ? Booking.find(admin ? {} : { userId: req.user.id }).sort({ createdAt: -1 }) : [],
    admin
      ? Driver.find()
      : req.user
        ? Driver.find({
            _id: {
              $in: await Booking.distinct('driverId', {
                userId: req.user.id,
                driverId: { $ne: null },
              }),
            },
          }).select('name')
        : [],
    admin ? User.find().sort({ createdAt: -1 }) : req.user ? [req.user] : [],
    Booking.find({ holding: true }).select('carId start end status -_id').lean(),
    admin ? Payment.find().sort({ createdAt: -1 }) : [],
  ]);
  send(res, {
    cars,
    reviews,
    bookings,
    drivers,
    users,
    availability,
    payments,
    user: req.user,
    paymentConfigured: Boolean(process.env.VNPAY_TMN_CODE && process.env.VNPAY_HASH_SECRET),
    mailConfigured: Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.MAIL_FROM,
    ),
    contactEmail: process.env.CONTACT_EMAIL || '',
  });
}

export async function contact(req, res) {
  const email = text(req.body, 'email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Email không hợp lệ.');
  await sendContactEmail({
    name: text(req.body, 'name', 2, 80),
    email,
    message: text(req.body, 'message', 10, 1000),
  });
  send(res, { message: 'Đã gửi lời nhắn đến nhóm ReCars.' });
}

// API danh sách xe hỗ trợ bộ lọc và phân trang để dùng bằng Thunder Client.
export async function listCars(req, res) {
  await expirePendingBookings();
  const filter = { active: true };
  for (const key of ['brand', 'type', 'location'])
    if (req.query[key] !== undefined) filter[key] = text(req.query, key);
  if (req.query.mode !== undefined) filter.modes = text(req.query, 'mode');
  for (const key of ['seats', 'maxPrice'])
    if (req.query[key] !== undefined) {
      const value = Number(text(req.query, key));
      if (!Number.isFinite(value) || value < 1) fail(400, 'Bộ lọc số không hợp lệ.');
      filter[key === 'maxPrice' ? 'price' : key] = key === 'maxPrice' ? { $lte: value } : value;
    }
  if (req.query.start !== undefined || req.query.end !== undefined) {
    const start = text(req.query, 'start'),
      end = text(req.query, 'end');
    rentalDates(start, end);
    filter._id = {
      $nin: await Booking.distinct('carId', {
        holding: true,
        start: { $lt: end },
        end: { $gt: start },
      }),
    };
  }
  const page = Math.max(1, Math.min(100000, Math.floor(Number(req.query.page) || 1)));
  const limit = Math.max(1, Math.min(50, Math.floor(Number(req.query.limit) || 12)));
  const [items, total] = await Promise.all([
    Car.find(filter)
      .sort({ price: req.query.sort === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Car.countDocuments(filter),
  ]);
  send(res, { items, total, page, pages: Math.ceil(total / limit) });
}
export async function getCar(req, res) {
  const car = await Car.findOne({ _id: req.params.id, active: true });
  if (!car) fail(404, 'Không tìm thấy xe.');
  send(res, car);
}

// Danh sách trường cho phép ngăn client sửa role, giá chốt của đơn hoặc trạng thái cọc.
const configs = {
  cars: {
    model: Car,
    fields: [
      'name',
      'brand',
      'plate',
      'type',
      'seats',
      'price',
      'gear',
      'fuel',
      'location',
      'image',
      'gallery',
      'modes',
      'active',
    ],
  },
  drivers: { model: Driver, fields: ['name', 'phone', 'license', 'active'] },
  users: { model: User, fields: ['active'] },
  reviews: { model: Review, fields: ['visible'] },
  payments: { model: Payment, fields: [] },
};
function config(name) {
  if (!configs[name]) fail(404, 'Không tìm thấy danh mục.');
  return configs[name];
}
export async function listRecords(req, res) {
  const { model } = config(req.params.collection);
  send(res, await model.find().sort({ createdAt: -1 }));
}
export async function createRecord(req, res) {
  const { model, fields: allowed } = config(req.params.collection);
  if (!['cars', 'drivers'].includes(req.params.collection))
    fail(405, 'Không hỗ trợ tạo tại đường dẫn này.');
  send(res, await model.create(fields(req.body, allowed)), 201);
}
export async function updateRecord(req, res) {
  const { model, fields: allowed } = config(req.params.collection);
  const patch = fields(req.body, allowed);
  if (!Object.keys(patch).length) fail(400, 'Không có trường được phép cập nhật.');
  for (const key of ['active', 'visible'])
    if (patch[key] !== undefined && typeof patch[key] !== 'boolean')
      fail(400, 'Trạng thái phải là true hoặc false.');
  const existing = await model.findById(req.params.id);
  if (!existing) fail(404, 'Không tìm thấy bản ghi.');
  if (model === User && existing.role === 'admin')
    fail(403, 'Không khóa tài khoản Admin tại màn hình khách hàng.');
  const record = await model.findByIdAndUpdate(
    req.params.id,
    { $set: patch },
    { returnDocument: 'after', runValidators: true },
  );
  if (model === User && patch.active === false)
    await User.updateOne({ _id: record.id }, { $unset: { sessionHash: 1, sessionExpires: 1 } });
  send(res, record);
}
