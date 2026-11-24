import { randomBytes, scrypt as derive, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { fail } from '../utils/http.js';

const scrypt = promisify(derive);
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');

// Salt riêng cho mỗi mật khẩu; scrypt bất đồng bộ không chặn request khác.
export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128)
    fail(400, 'Mật khẩu phải từ 8 đến 128 ký tự.');
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, stored = '') {
  if (typeof password !== 'string' || password.length > 128) return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const key = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return key.length === expected.length && timingSafeEqual(key, expected);
}
