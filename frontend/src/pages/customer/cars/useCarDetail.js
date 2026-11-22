import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { today, dateAfter, calculate, isAvailable } from '../../../utils/booking';
import { navigate } from '../../../hooks/useLocation';

// Hook quản lý dữ liệu và sự kiện; không chứa mã hiển thị JSX.
export default function useCarDetail({ id, params }) {
  // Tìm xe theo mã trên URL và lấy danh sách đánh giá/lịch xe dùng chung.
  const { data } = useApp();
  const car = data.cars.find((item) => item.id === id && item.active);
  // Lưu ngày nhận/trả và hình thức thuê, ưu tiên lựa chọn khách đã truyền qua URL.
  const [start, setStart] = useState(params.get('start') || dateAfter(today(), 1));
  const [end, setEnd] = useState(params.get('end') || dateAfter(today(), 3));
  const [mode, setMode] = useState(
    car?.modes.includes(params.get('mode')) ? params.get('mode') : car?.modes[0] || 'self',
  );
  // Dự tính chi phí; lưu ảnh đang chọn và trạng thái hộp phóng to ảnh.
  const cost = calculate(car?.price || 0, start, end, mode);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(false);
  // Gộp ảnh chính/ảnh bổ sung, bỏ ảnh rỗng và ảnh trùng bằng Set.
  const gallery = [...new Set([car?.image, ...(car?.gallery || [])].filter(Boolean))];
  // Kiểm tra nhanh lịch để hiển thị nút đặt xe; backend vẫn kiểm tra lại khi ghi đơn.
  const available =
    cost.days > 0 && start >= today() && isAvailable(data.availability, id, start, end);
  // Chỉ lấy đánh giá đúng xe và đang được phép hiển thị.
  const reviews = data.reviews.filter((r) => r.carId === id && r.visible);

  // Đồng bộ ngày trả rồi chuyển lịch trình đã chọn sang bước đặt xe.
  const changeStart = (event) => {
    const value = event.target.value;
    setStart(value);
    if (value >= end) setEnd(dateAfter(value, 1));
  };
  // Chuyển sang form đặt xe, mang theo ngày và hình thức khách vừa chọn.
  const submit = (event) => {
    event.preventDefault();
    navigate(`/booking/${id}?${new URLSearchParams({ start, end, mode })}`);
  };
  // CarDetail.jsx dùng những giá trị này để dựng bộ ảnh, thông tin và form thuê.
  return {
    car,
    start,
    changeStart,
    end,
    setEnd,
    mode,
    setMode,
    cost,
    available,
    reviews,
    submit,
    gallery,
    selectedImage: selectedImage || car?.image,
    setSelectedImage,
    zoom,
    setZoom,
  };
}
