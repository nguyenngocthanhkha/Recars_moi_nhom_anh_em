import { useState } from 'react';
import { navigate } from '../../hooks/useLocation';
import { dateAfter, today } from '../../utils/booking';

// Hook quản lý dữ liệu và sự kiện; không chứa mã hiển thị JSX.
export default function useSearchForm({ initial = {} }) {
  // Lưu hình thức thuê và ngày nhận/trả; ưu tiên giá trị truyền vào từ trang đang mở.
  const [mode, setMode] = useState(initial.mode || 'self');
  const [start, setStart] = useState(initial.start || dateAfter(today(), 1));
  const [end, setEnd] = useState(initial.end || dateAfter(today(), 3));
  // Đọc địa điểm và đưa bộ lọc lên URL /cars để trang danh sách xe sử dụng.
  const submit = (e) => {
    e.preventDefault();
    const values = new FormData(e.currentTarget);
    navigate(
      `/cars?${new URLSearchParams({ location: values.get('location'), start, end, mode })}`,
    );
  };

  // Đổi ngày nhận sẽ đẩy ngày trả lên nếu khoảng thuê không còn hợp lệ.
  const changeStart = (event) => {
    const value = event.target.value;
    setStart(value);
    if (value >= end) setEnd(dateAfter(value, 1));
  };
  // SearchForm.jsx nối các giá trị và hàm này với ô nhập/nút tìm xe.
  return { mode, setMode, start, changeStart, end, setEnd, submit };
}
