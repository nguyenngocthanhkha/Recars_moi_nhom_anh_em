import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';

// Quy ước chung: id dạng chuỗi, thời gian tạo/sửa và không lộ trường bí mật.
export function schema(fields) {
  return new mongoose.Schema(
    { _id: { type: String, default: randomUUID }, ...fields },
    {
      timestamps: true,
      versionKey: false,
      toJSON: {
        transform(doc, data) {
          data.id = data._id;
          for (const key of [
            '_id',
            'passwordHash',
            'sessionHash',
            'sessionExpires',
            'resetHash',
            'resetExpires',
            'slots',
            'holding',
            'paymentReceipts',
            'paymentTransactions',
            'paymentRevision',
            'paymentsSynced',
          ])
            delete data[key];
          return data;
        },
      },
    },
  );
}
export const requiredText = { type: String, required: true, trim: true, maxlength: 200 };
export const phone = { type: String, required: true, match: /^0\d{9}$/ };
