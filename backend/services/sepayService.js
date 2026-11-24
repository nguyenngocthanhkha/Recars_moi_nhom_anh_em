import {
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';

import { SePayPgClient } from 'sepay-pg-node';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

import {
  findAccessibleBooking,
  expirePendingBookings,
} from './bookingService.js';

import { syncBookingPayments } from './paymentSync.js';
import { fail } from '../utils/http.js';

export function sepayConfigured() {
  return Boolean(
    process.env.SEPAY_MERCHANT_ID &&
    process.env.SEPAY_SECRET_KEY
  );
}

export async function createSePayCheckout(bookingId, user) {
  if (!sepayConfigured()) {
    fail(503, 'SePay Sandbox chưa được cấu hình.');
  }

  const order = await findAccessibleBooking(bookingId, user);

  if (order.userId !== user.id) {
    fail(403, 'Chỉ chủ đơn được thanh toán.');
  }

  if (order.status !== 'pending' || order.depositPaid) {
    fail(409, 'Đơn không còn chờ thanh toán cọc.');
  }

  if (!Number.isSafeInteger(order.deposit) || order.deposit < 1) {
    fail(400, 'Số tiền cọc không hợp lệ.');
  }

  const payment = await Payment.create({
    _id: randomUUID().replaceAll('-', ''),
    bookingId,
    userId: user.id,
    amount: order.deposit,
  });

  const client = new SePayPgClient({
    env: 'sandbox',
    merchant_id: process.env.SEPAY_MERCHANT_ID,
    secret_key: process.env.SEPAY_SECRET_KEY,
  });

  const clientOrigin =
    process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  const resultUrl =
    `${clientOrigin}/#/payment-result/${bookingId}?status=pending&provider=sepay`;

  const checkoutFormfields =
    client.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: payment.id,
      order_amount: order.deposit,
      currency: 'VND',
      order_description: `ReCars deposit ${bookingId}`,
      success_url: resultUrl,
      error_url: resultUrl,
      cancel_url: resultUrl,
    });

  return {
    paymentId: payment.id,
    checkoutURL: client.checkout.initCheckoutUrl(),
    checkoutFormfields,
  };
}


// Xử lý IPN do SePay gửi về sau khi khách thanh toán.
export async function processSePayIpn(secretHeader, body) {
  const secret = process.env.SEPAY_IPN_SECRET_KEY;

  if (!secret) {
    return { status: 503, message: 'IPN chưa được cấu hình.' };
  }

  // Xác thực Secret Key trong header.
  const receivedKey = Buffer.from(
    typeof secretHeader === 'string' ? secretHeader : '',
  );
  const expectedKey = Buffer.from(secret);

  if (
    receivedKey.length !== expectedKey.length ||
    !timingSafeEqual(receivedKey, expectedKey)
  ) {
    return { status: 401, message: 'Invalid secret key' };
  }

  if (!body || typeof body !== 'object') {
    return { status: 400, message: 'Invalid payload' };
  }

  // Chỉ xử lý thông báo đơn hàng đã thanh toán.
  if (body.notification_type === 'TRANSACTION_VOID') {
    return { status: 200, message: 'Notification received' };
  }

  if (body.notification_type !== 'ORDER_PAID') {
    return { status: 200, message: 'Notification ignored' };
  }

  const orderInfo = body.order;
  const transaction = body.transaction;

  if (
    !orderInfo ||
    !transaction ||
    orderInfo.order_status !== 'CAPTURED' ||
    transaction.transaction_status !== 'APPROVED' ||
    orderInfo.order_currency !== 'VND' ||
    transaction.transaction_currency !== 'VND'
  ) {
    return { status: 400, message: 'Invalid payment information' };
  }

  const paymentId = orderInfo.order_invoice_number;
  const transactionNo = String(transaction.transaction_id || '');
  const orderAmount = Number(orderInfo.order_amount);
  const transactionAmount = Number(transaction.transaction_amount);

  if (
    typeof paymentId !== 'string' ||
    !paymentId ||
    !/^[A-Za-z0-9_-]{1,100}$/.test(transactionNo) ||
    !Number.isSafeInteger(orderAmount) ||
    !Number.isSafeInteger(transactionAmount) ||
    orderAmount < 1 ||
    orderAmount !== transactionAmount
  ) {
    return { status: 400, message: 'Invalid transaction data' };
  }

  const payment = await Payment.findById(paymentId);

  if (!payment) {
    return { status: 404, message: 'Payment not found' };
  }

  if (orderAmount !== payment.amount) {
    return { status: 400, message: 'Invalid payment amount' };
  }

  const booking = await Booking.findById(payment.bookingId)
    .select('+paymentReceipts');

  if (!booking) {
    return { status: 404, message: 'Booking not found' };
  }

  // IPN gửi lại không được ghi nhận thanh toán lần thứ hai.
  const recorded = booking.paymentReceipts.some(
    (item) => item.paymentId === paymentId,
  );

  if (recorded || payment.status !== 'pending') {
    await syncBookingPayments(booking.id);
    return { status: 200, message: 'Payment already processed' };
  }

  await expirePendingBookings();

  const receipt = {
    paymentId,
    amount: payment.amount,
    status: 'succeeded',
    responseCode: 'APPROVED',
    transactionNo,
    receivedAt: new Date(),
    refundRequired: false,
  };

  const condition = {
    _id: booking.id,
    'paymentReceipts.paymentId': { $ne: paymentId },
    paymentTransactions: { $ne: transactionNo },
  };

  const append = {
    $push: { paymentReceipts: receipt },
    $addToSet: { paymentTransactions: transactionNo },
    $inc: { paymentRevision: 1 },
  };

  // Chỉ xác nhận đơn nếu đơn vẫn còn hạn và chưa thanh toán cọc.
  let updated = await Booking.findOneAndUpdate(
    {
      ...condition,
      status: 'pending',
      depositPaid: false,
      expiresAt: { $gt: new Date() },
    },
    {
      ...append,
      $set: {
        status: 'paid',
        depositPaid: true,
        paidPaymentId: paymentId,
        paymentsSynced: false,
      },
    },
    { returnDocument: 'after' },
  );

  // Nếu đơn đã hết hạn hoặc không còn hợp lệ, lưu giao dịch
  // để Admin đối soát, không tự xác nhận đơn.
  if (!updated) {
    receipt.refundRequired = true;

    updated = await Booking.findOneAndUpdate(
      {
        ...condition,
        $or: [
          { status: { $ne: 'pending' } },
          { depositPaid: true },
          { expiresAt: { $lte: new Date() } },
        ],
      },
      {
        ...append,
        $set: {
          paymentsSynced: false,
          refundRequired: true,
        },
      },
      { returnDocument: 'after' },
    );
  }

  const stored = await Booking.findById(booking.id)
    .select('+paymentReceipts');

  if (!stored?.paymentReceipts.some(
    (item) => item.paymentId === paymentId,
  )) {
    return { status: 409, message: 'Conflicting transaction' };
  }

  // Đồng bộ biên nhận vào bảng Payment.
  await syncBookingPayments(booking.id);

  return {
    status: 200,
    message: updated ? 'Payment confirmed' : 'Payment requires reconciliation',
  };
}
