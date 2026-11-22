import { useState } from 'react';

// Hook quản lý dữ liệu và sự kiện; không chứa mã hiển thị JSX.
export default function useCarCard({ car, query = '' }) {
  // Lưu trạng thái nút trái tim trong lần xem hiện tại; không ghi vào database.
  const [liked, setLiked] = useState(false);
  // Giữ bộ lọc ngày/hình thức thuê trên liên kết đến trang chi tiết xe.
  const suffix = query ? `?${query}` : '';

  return { liked, setLiked, suffix };
}
