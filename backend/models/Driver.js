import mongoose from 'mongoose';
import { schema, requiredText, phone } from './schema.js';

// Tài xế là dữ liệu do Admin quản lý, khách không tự phân công.
export default mongoose.model(
  'Driver',
  schema({
    name: requiredText,
    phone,
    license: { ...requiredText, unique: true },
    active: { type: Boolean, default: true },
  }),
);
