// Frontend chỉ gọi HTTP; tuyệt đối không chứa mật khẩu database hoặc khóa VNPAY.
export async function api(path, { method = 'GET', body } = {}) {
  let response;
  // Gọi backend; credentials gửi cookie đăng nhập, timeout dừng chờ sau 15 giây.
  try {
    response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}${path}`, {
      method,
      credentials: 'include',
      signal: AbortSignal.timeout(15000),
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      // Đổi dữ liệu JavaScript thành chuỗi JSON trước khi gửi qua mạng.
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('Không kết nối được backend. Kiểm tra server và thử lại.');
  }
  // Đọc JSON trả về; lỗi HTTP hoặc success=false sẽ được báo cho nơi gọi hàm.
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success)
    throw Object.assign(
      new Error(result?.message || 'Không kết nối được backend. Kiểm tra server và thử lại.'),
      { status: response.status },
    );
  // Thành công thì chỉ trả phần data, giúp các trang dùng kết quả trực tiếp.
  return result.data;
}
