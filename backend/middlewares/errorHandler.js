// Chuẩn hóa lỗi MongoDB thành mã HTTP và thông báo dễ hiểu.
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error.status || 500;
  let message = error.message;
  if (error.code === 11000) {
    status = 409;
    message = 'Dữ liệu đã tồn tại hoặc lịch xe/tài xế vừa được giữ. Vui lòng kiểm tra lại.';
  } else if (['ValidationError', 'CastError', 'StrictModeError'].includes(error.name)) {
    status = 400;
    message = 'Dữ liệu không hợp lệ. Kiểm tra các trường vừa nhập.';
  }
  // Giữ lỗi nội bộ ở backend, trả thông báo chung cho người dùng.
  if (status >= 500 && !error.status) {
    console.error(error.name, error.message);
    message = 'Hệ thống chưa thể xử lý yêu cầu. Vui lòng thử lại.';
  }
  res.status(status).json({ success: false, message });
}
