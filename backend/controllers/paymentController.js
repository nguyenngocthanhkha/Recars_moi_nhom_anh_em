import {
  createSePayCheckout,
  processSePayIpn,
} from '../services/sepayService.js';
import Payment from '../models/Payment.js';
import { checkout, processIpn, verifyCallback } from '../services/vnpayService.js';
import { send } from '../utils/http.js';
import { text } from '../validators/input.js';

export async function createPayment(req, res) {
  send(res, await checkout(text(req.body, 'bookingId'), req.user, req.ip));
}
export async function ipn(req, res) {
  try {
    res.json(await processIpn(req.query));
  } catch (error) {
    console.error('VNPAY IPN:', error.message);
    res.json({ RspCode: '99', Message: 'Processing error' });
  }
}

// Chỉ dẫn người dùng về kết quả; tiền chỉ được xác nhận bởi IPN có chữ ký hợp lệ.
export async function returnUrl(req, res) {
  const valid = verifyCallback(req.query);
  const payment = valid && /^\d+$/.test(req.query.vnp_Amount || '')
    ? await Payment.findOne({ _id: req.query.vnp_TxnRef, amount: Number(req.query.vnp_Amount) / 100 })
    : null;
  const route = payment
    ? `/payment-result/${payment.bookingId}?status=${req.query.vnp_ResponseCode === '00' && req.query.vnp_TransactionStatus === '00' ? 'pending' : 'failed'}`
    : '/account/bookings?payment=invalid';
  res.redirect(`${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/#${route}`);
}
export async function createSePayPayment(req, res) {
  const bookingId = text(req.body, 'bookingId');

  const result = await createSePayCheckout(
    bookingId,
    req.user
  );

  send(res, result);
}
export async function sepayIpn(req, res) {
  try {
    const result = await processSePayIpn(
      req.headers['x-secret-key'],
      req.body,
    );

    return res.status(result.status).json({
      message: result.message,
    });
  } catch (error) {
    console.error('SePay IPN:', error.message);

    return res.status(500).json({
      message: 'Processing error',
    });
  }
}
