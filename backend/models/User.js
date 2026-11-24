import mongoose from 'mongoose';
import { schema, requiredText, phone } from './schema.js';

// Chỉ backend được đặt role; mật khẩu và phiên đăng nhập không trả về trình duyệt.
const userSchema = schema({
  name: requiredText,
  email: { ...requiredText, lowercase: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone,
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  active: { type: Boolean, default: true },
  sessionHash: { type: String, select: false },
  sessionExpires: { type: Date, select: false },
  resetHash: { type: String, select: false },
  resetExpires: { type: Date, select: false },
});
export default mongoose.model('User', userSchema);
