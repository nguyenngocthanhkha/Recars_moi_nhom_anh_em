import app from './app.js';
import mongoose from 'mongoose';
import connectDatabase from './config/database.js';
import User from './models/User.js';
import Car from './models/Car.js';
import Driver from './models/Driver.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';
import Review from './models/Review.js';
import { startExpiryJob } from './jobs/expireBookings.js';

// Đọc cổng từ .env; dùng 5000 khi chưa cấu hình.
const port = Number(process.env.PORT || 5000);

// Báo lỗi cấu hình rõ ràng thay vì khởi động với cổng không hợp lệ.
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT phải là số nguyên từ 1 đến 65535.');
}

// Chỉ mở API sau khi MongoDB kết nối thành công.
async function startServer() {
  await connectDatabase();
  // Chờ index chống trùng lịch sẵn sàng trước khi nhận request.
  await Promise.all([User, Car, Driver, Booking, Payment, Review].map((model) => model.init()));
  let stopExpiryJob = () => {};
  const server = app.listen(port, () => {
    stopExpiryJob = startExpiryJob();
    console.log(`ReCars API: http://localhost:${port}`);
    console.log(`Kiểm tra: http://localhost:${port}/api/health`);
  });

  // Đóng kết nối database nếu cổng HTTP đang bị sử dụng.
  server.on('error', async (error) => {
    console.error('Không thể mở cổng API:', error.message);
    stopExpiryJob();
    await mongoose.disconnect();
    process.exitCode = 1;
  });
}

// Kết nối thất bại thì báo lỗi và kết thúc, không mở API thiếu database.
startServer().catch(async (error) => {
  console.error('Không thể khởi động backend:', error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
