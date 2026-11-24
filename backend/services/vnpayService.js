import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import { findAccessibleBooking, expirePendingBookings } from './bookingService.js';
import { fail } from '../utils/http.js';
import { syncBookingPayments } from './paymentSync.js';

export const vnpayConfigured = () =>
  Boolean(process.env.VNPAY_TMN_CODE && process.env.VNPAY_HASH_SECRET);
const encode = (value) => encodeURIComponent(value).replace(/%20/g, '+');

// VNPAY 2.1.0: sắp xếp tham số, URL encode, ký HMAC-SHA512.
export function signature(query, secret = process.env.VNPAY_HASH_SECRET) {
  const payload = Object.keys(query)
    .filter(
      (key) => key.startsWith('vnp_') && !['vnp_SecureHash', 'vnp_SecureHashType'].includes(key),
    )
    .sort()
    .map((key) => `${encode(key)}=${encode(String(query[key]))}`)
    .join('&');
  return createHmac('sha512', secret).update(payload).digest('hex');
}
export function verifyCallback(query) {
  if (!vnpayConfigured() || Object.values(query).some((value) => typeof value !== 'string'))
    return false;
  if (
    !/^[a-f0-9]{128}$/i.test(query.vnp_SecureHash || '') ||
    query.vnp_TmnCode !== process.env.VNPAY_TMN_CODE
  )
    return false;
  return timingSafeEqual(
    Buffer.from(signature(query), 'hex'),
    Buffer.from(query.vnp_SecureHash, 'hex'),
  );
}
function vnpDate(date) {
  return date
    .toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false })
    .replace(/[- :]/g, '');
}
export async function checkout(bookingId, user, ip) {
  if (!vnpayConfigured())
    fail(503, 'Chưa cấu hình tài khoản VNPAY Sandbox. Không thể tạo giao dịch thanh toán.');
  const order = await findAccessibleBooking(bookingId, user);
  if (order.userId !== user.id) fail(403, 'Chỉ chủ đơn được thanh toán.');
  if (order.status !== 'pending' || order.depositPaid)
    fail(409, 'Đơn không còn chờ thanh toán cọc.');
  if (!Number.isSafeInteger(order.deposit) || !/^\d{1,12}$/.test(String(order.deposit * 100)))
    fail(400, 'Tiền cọc vượt giới hạn giao dịch VNPAY. Vui lòng liên hệ quản trị viên.');
  const payment = await Payment.create({
    _id: randomUUID().replaceAll('-', ''),
    bookingId,
    userId: user.id,
    amount: order.deposit,
  });
  const now = new Date();
  const expire = new Date(Math.min(now.getTime() + 15 * 60000, order.expiresAt.getTime()));
  const query = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: process.env.VNPAY_TMN_CODE,
    vnp_Amount: String(order.deposit * 100),
    vnp_CreateDate: vnpDate(now),
    vnp_ExpireDate: vnpDate(expire),
    vnp_CurrCode: 'VND',
    vnp_IpAddr: ip === '::1' ? '127.0.0.1' : ip.replace(/^::ffff:/, ''),
    vnp_Locale: 'vn',
    vnp_OrderInfo: `ReCars deposit ${bookingId}`,
    vnp_OrderType: 'other',
    vnp_ReturnUrl:
      process.env.VNPAY_RETURN_URL || 'http://localhost:5000/api/payments/vnpay-return',
    vnp_TxnRef: payment.id,
  };
  query.vnp_SecureHash = signature(query);
  return {
    paymentId: payment.id,
    url: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${Object.keys(query)
      .sort()
      .map((key) => `${encode(key)}=${encode(query[key])}`)
      .join('&')}`,
  };
}

// Chỉ IPN đã xác minh mới được ghi biên nhận; Return URL không tự ghi tiền.
export async function processIpn(query) {
  if (!verifyCallback(query)) return { RspCode: '97', Message: 'Invalid signature' };
  const payment = await Payment.findById(query.vnp_TxnRef);
  if (!payment) return { RspCode: '01', Message: 'Order not found' };
  if (
    !/^\d+$/.test(query.vnp_Amount || '') ||
    Number(query.vnp_Amount) !== payment.amount * 100 ||
    (query.vnp_CurrCode && query.vnp_CurrCode !== 'VND')
  )
    return { RspCode: '04', Message: 'Invalid amount' };
  if (!/^\d{2}$/.test(query.vnp_ResponseCode || '') ||
      !/^\d{2}$/.test(query.vnp_TransactionStatus || ''))
    return { RspCode: '99', Message: 'Invalid result' };
  const succeeded = query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00';
  if (succeeded && (!/^\d{1,15}$/.test(query.vnp_TransactionNo || '') ||
      /^0+$/.test(query.vnp_TransactionNo)))
    return { RspCode: '99', Message: 'Invalid transaction' };

  const order = await Booking.findById(payment.bookingId).select('+paymentReceipts');
  if (!order) return { RspCode: '01', Message: 'Order not found' };
  const recorded = order.paymentReceipts.some((item) => item.paymentId === payment.id);
  // Callback cũ chỉ đồng bộ lại sổ giao dịch, không thay đổi kết quả đã ghi nhận.
  if (recorded || payment.status !== 'pending') {
    await syncBookingPayments(order.id);
    return { RspCode: '02', Message: 'Order already confirmed' };
  }

  await expirePendingBookings();
  const receipt = {
    paymentId: payment.id, amount: payment.amount,
    status: succeeded ? 'succeeded' : 'failed',
    responseCode: query.vnp_ResponseCode, receivedAt: new Date(),
    ...(succeeded ? { transactionNo: query.vnp_TransactionNo } : {}),
    refundRequired: false,
  };
  const condition = {
    _id: order.id,
    'paymentReceipts.paymentId': { $ne: payment.id },
    ...(succeeded ? { paymentTransactions: { $ne: receipt.transactionNo } } : {}),
  };
  const append = {
    $push: { paymentReceipts: receipt },
    $inc: { paymentRevision: 1 },
    ...(succeeded ? { $addToSet: { paymentTransactions: receipt.transactionNo } } : {}),
  };

  // Một lệnh ghi cả cọc và biên nhận: tiến trình dừng sau đây cũng không mất giữ xe.
  let updated = succeeded && await Booking.findOneAndUpdate(
    { ...condition, status: 'pending', depositPaid: false, expiresAt: { $gt: new Date() } },
    { ...append, $set: {
      status: 'paid', depositPaid: true, paidPaymentId: payment.id, paymentsSynced: false,
    } },
    { returnDocument: 'after' },
  );

  // Đã hết hạn/hủy/cọc trùng: lưu tiền cần đối soát, giữ nguyên trạng thái và lịch.
  if (!updated) {
    receipt.refundRequired = succeeded;
    updated = await Booking.findOneAndUpdate(
      { ...condition, ...(succeeded ? { $or: [
        { status: { $ne: 'pending' } }, { depositPaid: true }, { expiresAt: { $lte: new Date() } },
      ] } : {}) },
      { ...append, $set: {
        paymentsSynced: false, ...(succeeded ? { refundRequired: true } : {}),
      } },
      { returnDocument: 'after' },
    );
  }
  const stored = await Booking.findById(order.id).select('+paymentReceipts');
  if (!stored?.paymentReceipts.some((item) => item.paymentId === payment.id))
    return { RspCode: '99', Message: 'Conflicting transaction' };
  // Chỉ trả 00/02 sau khi đồng bộ thành công; lỗi sẽ trả 99 để VNPAY gửi lại.
  await syncBookingPayments(order.id);
  return {
    RspCode: updated ? '00' : '02',
    Message: updated ? 'Confirm Success' : 'Order already confirmed',
  };
}
