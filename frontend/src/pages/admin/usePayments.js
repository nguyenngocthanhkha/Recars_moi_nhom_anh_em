import { useState } from 'react';
import { useApp } from '../../context/AppContext';

// Chỉ đọc giao dịch do backend ghi nhận; frontend không tự sửa kết quả VNPAY.
export default function usePayments() {
  // Lưu nội dung tìm kiếm, trạng thái giao dịch và trang danh sách đang xem.
  const { data } = useApp();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  // Lọc giao dịch theo trạng thái và mã giao dịch/mã đơn, không phân biệt hoa thường.
  const records = data.payments.filter(
    (item) =>
      (!status || item.status === status) &&
      `${item.id} ${item.bookingId}`.toLowerCase().includes(search.toLowerCase()),
  );
  // Khi đổi bộ lọc thì quay về trang 1 để không rơi vào trang không có kết quả.
  const changeSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };
  const changeStatus = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };
  // Payments.jsx chỉ nhận kết quả để dựng bảng, không tự xác nhận tiền.
  return { records, search, status, page, setPage, changeSearch, changeStatus };
}
