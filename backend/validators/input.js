import { fail } from '../utils/http.js';

// Chỉ nhận chuỗi có độ dài hợp lệ; không cho object truy vấn lọt vào MongoDB.
export function text(body, key, min = 1, max = 200) {
  const value = body?.[key];
  if (typeof value !== 'string' || value.trim().length < min || value.length > max)
    fail(400, `${key}: dữ liệu không hợp lệ.`);
  return value.trim();
}
// Chỉ lấy các trường được phép cập nhật, bỏ trường ngoài danh sách.
export const fields = (body, keys) =>
  Object.fromEntries(
    keys.filter((key) => body?.[key] !== undefined).map((key) => [key, body[key]]),
  );
