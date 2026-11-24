import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

// Payment là sổ giao dịch; biên nhận trong Booking là căn cứ khôi phục khi ghi bị lỗi.
export async function syncBookingPayments(id) {
  const order = await Booking.findById(id)
    .select('+paymentReceipts +paymentRevision +paymentsSynced')
    .lean();
  if (!order || order.paymentsSynced !== false) return;
  for (const receipt of order.paymentReceipts) {
    const refund =
      receipt.status === 'succeeded' &&
      (receipt.refundRequired || ['cancelled', 'expired'].includes(order.status));
    const result = await Payment.updateOne(
      { _id: receipt.paymentId, bookingId: id, amount: receipt.amount },
      {
        $set: {
          status: receipt.status,
          responseCode: receipt.responseCode,
          receivedAt: receipt.receivedAt,
          ...(receipt.transactionNo ? { transactionNo: receipt.transactionNo } : {}),
          ...(refund ? { refundRequired: true } : {}),
        },
      },
    );
    if (result.matchedCount !== 1) throw new Error('Không tìm thấy giao dịch để đồng bộ.');
  }
  // Có IPN/hủy đơn mới trong lúc đồng bộ thì giữ cờ để job chạy lại.
  await Booking.updateOne(
    { _id: id, paymentRevision: order.paymentRevision },
    { $set: { paymentsSynced: true } },
  );
}

// Chạy khi khởi động và mỗi phút; không cần đổi MongoDB local thành replica set.
export async function reconcilePayments() {
  const orders = await Booking.find({ paymentsSynced: false }).select('_id').lean();
  for (const order of orders) await syncBookingPayments(order._id);
}
