import mongoose from 'mongoose';
import { schema, requiredText, phone } from './schema.js';

// Biên nhận IPN nằm cùng đơn: ghi cọc và biên nhận trong một thao tác MongoDB.
const receiptSchema = new mongoose.Schema(
  {
    paymentId: String,
    amount: Number,
    status: { type: String, enum: ['succeeded', 'failed'] },
    responseCode: String,
    transactionNo: String,
    receivedAt: Date,
    refundRequired: Boolean,
  },
  { _id: false },
);

const bookingSchema = schema({
  userId: { type: String, ref: 'User', required: true, index: true },
  carId: { type: String, ref: 'Car', required: true },
  driverId: { type: String, ref: 'Driver', default: null },
  carName: requiredText,
  carImage: String,
  name: requiredText,
  phone,
  location: requiredText,
  dropoff: requiredText,
  note: { type: String, maxlength: 1000, default: '' },
  mode: { type: String, enum: ['self', 'driver'], required: true },
  start: requiredText,
  end: requiredText,
  days: Number,
  price: Number,
  rental: Number,
  driverFee: Number,
  total: Number,
  rate: Number,
  deposit: Number,
  remaining: Number,
  status: {
    type: String,
    enum: ['pending', 'paid', 'confirmed', 'renting', 'completed', 'cancelled', 'expired'],
    default: 'pending',
    index: true,
  },
  expiresAt: { type: Date, required: true, index: true },
  depositPaid: { type: Boolean, default: false },
  balancePaid: { type: Boolean, default: false },
  paidPaymentId: { type: String, default: null },
  refundRequired: { type: Boolean, default: false },
  paymentReceipts: { type: [receiptSchema], default: [], select: false },
  paymentTransactions: { type: [String], default: undefined, select: false },
  paymentRevision: { type: Number, default: 0, select: false },
  paymentsSynced: { type: Boolean, default: true, select: false },
  holding: { type: Boolean, default: true, select: false },
  slots: { type: [String], select: false },
});

// Mỗi mã giao dịch thành công chỉ thuộc một đơn, kể cả khi IPN chạy đồng thời.
bookingSchema.index(
  { paymentTransactions: 1 },
  {
    unique: true,
    partialFilterExpression: { 'paymentTransactions.0': { $exists: true } },
    name: 'unique_payment_transaction',
  },
);

// Index duy nhất chặn hai request đồng thời giữ cùng xe hoặc tài xế trong một ngày.
bookingSchema.index(
  { carId: 1, slots: 1 },
  { unique: true, partialFilterExpression: { holding: true }, name: 'unique_car_day' },
);
bookingSchema.index(
  { driverId: 1, slots: 1 },
  {
    unique: true,
    partialFilterExpression: { holding: true, driverId: { $type: 'string' } },
    name: 'unique_driver_day',
  },
);
export default mongoose.model('Booking', bookingSchema);
