import mongoose from 'mongoose';
import { schema, requiredText } from './schema.js';

// Index bookingId bảo đảm mỗi đơn chỉ có một đánh giá, kể cả khi gửi đồng thời.
export default mongoose.model(
  'Review',
  schema({
    bookingId: { type: String, ref: 'Booking', required: true, unique: true },
    userId: { type: String, ref: 'User', required: true },
    carId: { type: String, ref: 'Car', required: true, index: true },
    name: requiredText,
    stars: { type: Number, min: 1, max: 5, required: true, validate: Number.isInteger },
    text: { type: String, trim: true, minlength: 10, maxlength: 1000, required: true },
    visible: { type: Boolean, default: true },
  }),
);
