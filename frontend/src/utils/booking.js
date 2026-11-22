// Ngày được tính theo UTC để khoảng thuê không lệch khi đổi múi giờ.
export const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
export const dateAfter = (date, count) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + count * 86400000).toISOString().slice(0, 10);
// Hiển thị số tiền theo VND, ví dụ 1000000 thành dạng 1.000.000 ₫.
export const money = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
// Đổi ngày YYYY-MM-DD thành cách hiển thị ngày/tháng/năm cho người Việt.
export const shortDate = (value) =>
  new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('vi-VN');

// Dự tính chung cho giao diện; backend vẫn đọc giá database và tự tính khi tạo đơn.
export function calculate(price, start, end, mode) {
  // 86.400.000 là số mili giây một ngày; ngày trả không tính là một ngày thuê thêm.
  const days = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 86400000)) || 0;
  const rental = price * days;
  const driverFee = mode === 'driver' ? days * 500000 : 0;
  // Cọc có tài xế là 20% tổng gồm phí tài xế; tự lái là 30% tiền xe.
  const total = rental + driverFee;
  const rate = mode === 'driver' ? 0.2 : 0.3;
  const deposit = Math.round(total * rate);
  return { days, rental, driverFee, total, rate, deposit, remaining: total - deposit };
}

// Ước tính trạng thái cho việc lọc lịch trên giao diện; job backend mới lưu hết hạn thật.
export function expireBookings(bookings, now = Date.now()) {
  return bookings.map((order) =>
    order.status === 'pending' && now >= Date.parse(order.createdAt) + 3 * 86400000
      ? { ...order, status: 'expired' }
      : order,
  );
}
// Xe trống khi không có đơn đang giữ lịch giao với [start, end); có thể bỏ qua một mã đơn.
export function isAvailable(bookings, carId, start, end, ignoreId) {
  return !expireBookings(bookings).some(
    (order) =>
      order.id !== ignoreId &&
      order.carId === carId &&
      !['cancelled', 'expired', 'completed'].includes(order.status) &&
      start < order.end &&
      end > order.start,
  );
}
