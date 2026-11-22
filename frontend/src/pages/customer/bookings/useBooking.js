import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { calculate, today, dateAfter } from '../../../utils/booking';
import { navigate } from '../../../hooks/useLocation';

// Bảng giá trên frontend là dự tính; backend tính lại theo giá xe trong MongoDB.
export default function useBooking({ id, params }) {
  // Lấy dữ liệu chung, hàm tạo bản ghi và hàm hiện thông báo.
  const { data, add, notify } = useApp();
  // Tìm xe đang hoạt động có mã trùng id trên URL.
  const car = data.cars.find((item) => item.id === id && item.active);
  // Lấy ngày từ URL; nếu chưa có thì đặt ngày nhận sau 1 ngày, trả sau 3 ngày.
  const [start, setStart] = useState(params.get('start') || dateAfter(today(), 1));
  const [end, setEnd] = useState(params.get('end') || dateAfter(today(), 3));
  // Chọn hình thức thuê mà xe hỗ trợ; self là tự lái, driver là có tài xế.
  const [mode, setMode] = useState(
    car?.modes.includes(params.get('mode')) ? params.get('mode') : car?.modes[0] || 'self',
  );
  // error giữ thông báo lỗi; busy khóa nút trong lúc đang gửi yêu cầu.
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Dự tính chi phí để khách xem trước; backend sẽ tự tính lại khi tạo đơn.
  const cost = calculate(car?.price || 0, start, end, mode);

  const submit = async (event) => {
    // Ngăn trình duyệt tải lại trang và đọc các ô có thuộc tính name trong form.
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    // Ngày sai thì báo lỗi ngay trên màn hình và dừng gửi đơn.
    if (!cost.days || start < today())
      return setError('Ngày nhận phải từ hôm nay và ngày trả phải sau ngày nhận.');
    // Bắt đầu gửi: khóa nút đặt xe và xóa thông báo lỗi cũ.
    setBusy(true);
    setError('');
    try {
      // add gọi API tạo đơn; ...values lấy các thông tin khách vừa nhập.
      const order = await add('bookings', { ...values, carId: id, start, end, mode });
      notify('Đã tạo đơn. Bạn có tối đa 3 ngày để thanh toán cọc.');
      // Tạo thành công thì mở trang thanh toán theo mã đơn backend trả về.
      navigate(`/payment/${order.id}`);
    } catch (err) {
      // Nếu API báo lỗi hoặc mất kết nối, hiện nội dung lỗi cho khách.
      setError(err.message);
    } finally {
      // Dù thành công hay thất bại, kết thúc trạng thái đang gửi.
      setBusy(false);
    }
  };
  // Cung cấp các giá trị và hàm để Booking.jsx nối vào form.
  return { data, car, start, setStart, end, setEnd, mode, setMode, error, busy, cost, submit };
}
