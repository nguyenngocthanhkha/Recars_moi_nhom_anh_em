import mongoose from 'mongoose';
import { schema } from './schema.js';

// Lưu từng lần thanh toán; transactionNo và checksum được xác minh ở service VNPAY.
const paymentSchema = schema({
  bookingId: { type: String, ref: 'Booking', required: true, index: true },
  userId: { type: String, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
  transactionNo: { type: String, maxlength: 100 },
  responseCode: { type: String, maxlength: 10 },
  receivedAt: Date,
  refundRequired: { type: Boolean, default: false },
});
paymentSchema.index(
  { transactionNo: 1 },
  {
    unique: true,
    partialFilterExpression: { transactionNo: { $type: 'string' }, status: 'succeeded' },
  },
);
export default mongoose.model('Payment', paymentSchema);
