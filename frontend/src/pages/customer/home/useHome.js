// useState lưu lựa chọn trên màn hình; useApp lấy dữ liệu chung từ backend.
import { useState } from 'react';
import { useApp } from '../../../context/AppContext';

// File này chuẩn bị dữ liệu cho Home.jsx; không dựng thẻ giao diện.
export default function useHome() {
  // Lấy danh sách xe và đánh giá đã tải từ API.
  const { data } = useApp();
  // Ban đầu chọn Tất cả; setCategory thay lựa chọn khi khách bấm loại xe.
  const [category, setCategory] = useState('Tất cả');
  // filter: giữ xe đang hoạt động và đúng loại; slice(0, 3): chỉ lấy 3 xe đầu.
  const available = data.cars
    .filter((car) => car.active && (category === 'Tất cả' || car.type === category))
    .slice(0, 3);

  // Chỉ lấy tối đa 3 đánh giá mà Admin cho phép hiển thị.
  const visibleReviews = data.reviews.filter((review) => review.visible).slice(0, 3);
  // Trả dữ liệu và hàm đổi loại xe để Home.jsx sử dụng.
  return { category, setCategory, available, visibleReviews };
}
