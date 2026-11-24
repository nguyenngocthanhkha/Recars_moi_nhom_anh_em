import mongoose from 'mongoose';

// Đọc địa chỉ database từ .env và chờ kết nối hoàn tất.
export default async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Thiếu MONGODB_URI trong backend/.env.');

  // Giới hạn thời gian tìm server để báo lỗi sớm khi MongoDB chưa chạy.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`MongoDB đã kết nối: ${mongoose.connection.name}`);
}

// Ping chỉ kiểm tra kết nối, không tạo collection hay ghi dữ liệu.
export async function checkDatabase() {
  if (mongoose.connection.readyState !== 1) return false;
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch {
    return false;
  }
}
