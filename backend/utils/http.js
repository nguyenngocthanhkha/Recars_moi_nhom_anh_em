// Lỗi có mã HTTP để controller và middleware dùng chung.
export function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

export const send = (res, data, status = 200) => res.status(status).json({ success: true, data });
