import User from '../models/User.js';
import { hashToken } from '../services/password.js';
import { fail } from '../utils/http.js';

// Cookie chỉ chứa token ngẫu nhiên; database chỉ lưu hash của token.
export async function readSession(req, res, next) {
  const token = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('recars_session='))
    ?.slice(15);
  req.user =
    token && /^[a-f0-9]{64}$/.test(token)
      ? await User.findOne({
          sessionHash: hashToken(token),
          sessionExpires: { $gt: new Date() },
          active: true,
        })
      : null;
  next();
}
export function requireUser(req, res, next) {
  if (!req.user) fail(401, 'Vui lòng đăng nhập.');
  next();
}
export function requireAdmin(req, res, next) {
  if (!req.user) fail(401, 'Vui lòng đăng nhập.');
  if (req.user.role !== 'admin') fail(403, 'Bạn không có quyền quản trị.');
  next();
}

// Chống request thay đổi dữ liệu từ website khác; Thunder Client không gửi Origin vẫn dùng được.
export function protectOrigin(req, res, next) {
  const allowed = [
    process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    process.env.API_ORIGIN || 'http://localhost:5000',
  ];
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
    req.headers.origin &&
    !allowed.includes(req.headers.origin)
  )
    fail(403, 'Nguồn yêu cầu không hợp lệ.');
  next();
}

// Giới hạn thử đăng nhập trong cửa sổ 15 phút; không giữ danh sách vô hạn.
const attempts = new Map();
export function limitAuth(req, res, next) {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until < now) attempts.delete(key);
  const key = req.ip;
  const attempt = attempts.get(key) || { count: 0, until: now + 15 * 60000 };
  attempt.count += 1;
  attempts.set(key, attempt);
  if (attempt.count > 50) fail(429, 'Bạn đã thử quá nhiều lần. Vui lòng chờ 15 phút.');
  next();
}
