// Chỉ chứa nhãn hiển thị và ảnh banner. Xe/tài khoản/đơn thuê đều lấy từ API.
export const heroImage =
  'https://images.unsplash.com/photo-1589372248538-1d480ec6cfae?auto=format&fit=crop&w=1200&q=85';
// Đổi mã trạng thái backend sang tiếng Việt để dùng ở nhãn trên giao diện.
export const statusNames = {
  pending: 'Chờ thanh toán cọc',
  paid: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  renting: 'Đang thuê',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
  expired: 'Đã hết hạn',
};
// Hai hình thức thuê, dùng chung để các trang hiển thị thống nhất.
export const modeNames = { self: 'Tự lái', driver: 'Có tài xế' };
