import nodemailer from 'nodemailer';
import { fail } from '../utils/http.js';

// Bí mật SMTP chỉ đặt trong backend/.env, không đưa vào mã frontend.
export function mailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.MAIL_FROM,
  );
}

// Gửi liên hệ đến hộp thư nhóm; chưa có cấu hình thì báo rõ, không giả vờ đã gửi.
export async function sendContactEmail({ name, email, message }) {
  if (!mailConfigured() || !process.env.CONTACT_EMAIL) fail(503, 'Chưa cấu hình hộp thư liên hệ.');
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    requireTLS: process.env.SMTP_SECURE !== 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 10000,
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.CONTACT_EMAIL,
    replyTo: email,
    subject: 'ReCars – Liên hệ từ website',
    text: `Họ tên: ${name}\nEmail: ${email}\n\n${message}`,
  });
}
export async function sendResetEmail(email, token) {
  if (!mailConfigured())
    fail(503, 'Chưa cấu hình email khôi phục mật khẩu. Vui lòng liên hệ quản trị viên.');
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    requireTLS: process.env.SMTP_SECURE !== 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 10000,
  });
  const url = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/#/reset-password?token=${token}`;
  await transport.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'ReCars – Đặt lại mật khẩu',
    text: `Mở liên kết để đặt lại mật khẩu trong 15 phút:\n${url}\nNếu bạn không yêu cầu, hãy bỏ qua email này.`,
  });
}
