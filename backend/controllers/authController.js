import { randomBytes } from 'node:crypto';
import User from '../models/User.js';
import { hashPassword, verifyPassword, hashToken } from '../services/password.js';
import { mailConfigured, sendResetEmail } from '../services/mail.js';
import { fail, send } from '../utils/http.js';
import { text } from '../validators/input.js';

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 7 * 86400000,
});

// Mỗi lần đăng nhập phát token mới và chỉ lưu hash trong MongoDB.
async function createSession(res, user) {
  const token = randomBytes(32).toString('hex');
  await User.updateOne(
    { _id: user.id },
    { sessionHash: hashToken(token), sessionExpires: new Date(Date.now() + 7 * 86400000) },
  );
  res.cookie('recars_session', token, cookieOptions());
  return user;
}
export async function register(req, res) {
  if (req.body?.confirm !== undefined && req.body.password !== req.body.confirm)
    fail(400, 'Mật khẩu xác nhận chưa trùng khớp.');
  const user = await User.create({
    name: text(req.body, 'name', 2, 80),
    email: text(req.body, 'email').toLowerCase(),
    phone: text(req.body, 'phone'),
    passwordHash: await hashPassword(req.body?.password),
  });
  send(res, await createSession(res, user), 201);
}
export async function login(req, res) {
  const email = text(req.body, 'email').toLowerCase();
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await verifyPassword(req.body?.password, user.passwordHash)))
    fail(401, 'Email hoặc mật khẩu không đúng.');
  if (!user.active) fail(403, 'Tài khoản đã bị khóa.');
  send(res, await createSession(res, user));
}
export async function logout(req, res) {
  if (req.user)
    await User.updateOne({ _id: req.user.id }, { $unset: { sessionHash: 1, sessionExpires: 1 } });
  res.clearCookie('recars_session', { ...cookieOptions(), maxAge: undefined });
  send(res, null);
}
export async function profile(req, res) {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name: text(req.body, 'name', 2, 80), phone: text(req.body, 'phone') },
    { returnDocument: 'after', runValidators: true },
  );
  send(res, user);
}
export async function changePassword(req, res) {
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!(await verifyPassword(req.body?.currentPassword, user.passwordHash)))
    fail(400, 'Mật khẩu hiện tại không đúng.');
  user.passwordHash = await hashPassword(req.body?.newPassword);
  await user.save();
  send(res, await createSession(res, user));
}

// Trả cùng thông báo cho email tồn tại/không tồn tại; token không trả qua API.
export async function forgotPassword(req, res) {
  const email = text(req.body, 'email').toLowerCase();
  if (!mailConfigured()) fail(503, 'Chưa cấu hình SMTP để gửi email khôi phục mật khẩu.');
  const user = await User.findOne({ email, active: true });
  if (user) {
    const token = randomBytes(32).toString('hex');
    await User.updateOne(
      { _id: user.id },
      { resetHash: hashToken(token), resetExpires: new Date(Date.now() + 15 * 60000) },
    );
    await sendResetEmail(email, token);
  }
  send(res, { message: 'Nếu email hợp lệ, liên kết khôi phục sẽ được gửi đến hộp thư của bạn.' });
}
export async function resetPassword(req, res) {
  const token = text(req.body, 'token', 64, 64);
  const passwordHash = await hashPassword(req.body?.password);
  const user = await User.findOneAndUpdate(
    { resetHash: hashToken(token), resetExpires: { $gt: new Date() }, active: true },
    {
      $set: { passwordHash },
      $unset: { resetHash: 1, resetExpires: 1, sessionHash: 1, sessionExpires: 1 },
    },
    { returnDocument: 'after' },
  );
  if (!user) fail(400, 'Liên kết hết hạn hoặc không hợp lệ.');
  res.clearCookie('recars_session', { ...cookieOptions(), maxAge: undefined });
  send(res, { message: 'Đã đặt lại mật khẩu. Vui lòng đăng nhập.' });
}
