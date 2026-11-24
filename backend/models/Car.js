import mongoose from 'mongoose';
import { schema, requiredText } from './schema.js';

// Giá ở database là nguồn tính tiền chính thức, không lấy giá do frontend gửi lên.
const carSchema = schema({
  name: requiredText,
  brand: requiredText,
  plate: { ...requiredText, unique: true },
  type: { type: String, enum: ['SUV', 'Sedan', 'Thể thao'], required: true },
  seats: { type: Number, min: 2, max: 45, required: true, validate: Number.isInteger },
  price: {
    type: Number,
    min: 1000,
    max: 100000000,
    required: true,
    validate: Number.isSafeInteger,
  },
  gear: { type: String, enum: ['Tự động', 'Số sàn'], required: true },
  fuel: { type: String, enum: ['Xăng', 'Dầu diesel', 'Điện'], required: true },
  location: { ...requiredText, default: 'Quy Nhơn' },
  image: { ...requiredText, maxlength: 2000, match: /^https:\/\// },
  gallery: [{ type: String, maxlength: 2000, match: /^https:\/\// }],
  modes: {
    type: [{ type: String, enum: ['self', 'driver'] }],
    default: ['self', 'driver'],
    validate: (value) => value.length > 0,
  },
  active: { type: Boolean, default: true },
});
export default mongoose.model('Car', carSchema);
