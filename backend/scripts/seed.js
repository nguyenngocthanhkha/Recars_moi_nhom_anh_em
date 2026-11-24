import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import connectDatabase from '../config/database.js';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Driver from '../models/Driver.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import { hashPassword } from '../services/password.js';
import { cars, drivers } from './fixtures.js';

// Chỉ thêm bản ghi chưa tồn tại; chạy lại không xóa hoặc đổi dữ liệu người dùng.
try {
  await connectDatabase();
  await Promise.all([User, Car, Driver, Booking, Payment, Review].map((model) => model.init()));
  for (const car of cars)
    await Car.updateOne(
      { _id: car._id },
      { $setOnInsert: car },
      { upsert: true, runValidators: true },
    );
  for (const driver of drivers)
    await Driver.updateOne(
      { _id: driver._id },
      { $setOnInsert: driver },
      { upsert: true, runValidators: true },
    );

  // Mật khẩu sinh ngẫu nhiên, ghi file cục bộ đã được gitignore thay vì hard-code.
  for (const role of ['admin', 'customer']) {
    const email = `${role}@recars.local`;
    if (await User.exists({ email })) continue;
    const password = randomBytes(12).toString('base64url');
    await User.create({
      name: role === 'admin' ? 'Quản trị ReCars' : 'Khách trải nghiệm',
      email,
      phone: '0901234567',
      role,
      passwordHash: await hashPassword(password),
    });
    fs.appendFileSync(
      '.recars-accounts.txt',
      `${role}\nEmail: ${email}\nPassword: ${password}\n\n`,
      { mode: 0o600 },
    );
  }
  console.log('Đã khởi tạo xe, tài xế và tài khoản trong MongoDB.');
  console.log(
    'Mở backend/.recars-accounts.txt trên máy để xem tài khoản, không đăng file này lên Git.',
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
