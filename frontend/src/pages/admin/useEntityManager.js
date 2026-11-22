import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { adminSections as sections } from '../../constants/admin';

// Mỗi dòng định nghĩa tên trường gửi API, nhãn hiển thị và kiểu ô nhập cho form xe.
const carFields = [
  ['name', 'Tên xe', 'text'],
  ['brand', 'Hãng xe', 'text'],
  ['plate', 'Biển số', 'text'],
  ['type', 'Loại xe', ['SUV', 'Sedan', 'Thể thao']],
  ['seats', 'Số chỗ', 'number'],
  ['price', 'Giá thuê/ngày', 'number'],
  ['gear', 'Hộp số', ['Tự động', 'Số sàn']],
  ['fuel', 'Nhiên liệu', ['Xăng', 'Dầu diesel', 'Điện']],
  ['location', 'Địa điểm', 'text'],
  ['image', 'URL ảnh (HTTPS)', 'url'],
  ['gallery', 'Ảnh bổ sung (mỗi dòng một URL HTTPS)', 'textarea'],
];
// Form tài xế dùng cùng cách dựng ô nhập, nhưng chỉ có 3 trường bên dưới.
const driverFields = [
  ['name', 'Họ tên', 'text'],
  ['phone', 'Số điện thoại', 'tel'],
  ['license', 'Giấy phép lái xe', 'text'],
];

// Hook quản lý dữ liệu và sự kiện; không chứa mã hiển thị JSX.
export default function useEntityManager({ section }) {
  // Chuyển mục menu thành tên danh sách: customers tương ứng users trong dữ liệu API.
  const { data, add, update, notify } = useApp();
  const collection = { cars: 'cars', drivers: 'drivers', customers: 'users', reviews: 'reviews' }[
    section
  ];
  const title = sections.find(([key]) => key === section)?.[2];
  // Lưu bộ lọc, số trang và bản ghi đang được sửa/xem lịch sử/xác nhận ẩn.
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [history, setHistory] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const fields = section === 'cars' ? carFields : driverFields;
  // Lọc theo nội dung tìm kiếm và trạng thái; mục khách hàng chỉ lấy role customer.
  const records = (data[collection] || []).filter(
    (item) =>
      (section !== 'customers' || item.role === 'customer') &&
      `${item.name} ${item.email || ''} ${item.plate || ''} ${item.text || ''}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!filter || String(section === 'reviews' ? item.visible : item.active) === filter),
  );
  // Bấm ẩn/kích hoạt chỉ mở hộp xác nhận trước khi gửi yêu cầu thật.
  const toggle = (item) => setConfirmation(item);
  // Đọc form, chuẩn hóa dữ liệu rồi chọn thêm mới hoặc cập nhật bản ghi.
  const save = async (e) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    if (section === 'cars') {
      // Đổi giá/số chỗ thành số; tách nhiều URL ảnh thành danh sách và đọc hình thức thuê.
      values.price = Number(values.price);
      values.seats = Number(values.seats);
      values.gallery = (values.gallery || '')
        .split(/\r?\n/)
        .map((value) => value.trim())
        .filter(Boolean);
      values.modes = ['self', 'driver'].filter((mode) => values[`mode-${mode}`]);
      delete values['mode-self'];
      delete values['mode-driver'];
      if (!values.modes.length) return notify('Hãy chọn ít nhất một hình thức thuê.');
      if (!values.image.startsWith('https://'))
        return notify('URL ảnh phải bắt đầu bằng https://.');
    }
    // Có editing.id là sửa bản ghi cũ; chưa có id là tạo bản ghi mới.
    try {
      if (editing.id) await update(collection, editing.id, values);
      else await add(collection, values);
      setEditing(null);
      notify('Đã lưu thông tin.');
    } catch (err) {
      notify(err.message);
    }
  };

  // Ẩn/kích hoạt bản ghi sau khi người dùng xác nhận.
  const confirmToggle = async () => {
    const key = section === 'reviews' ? 'visible' : 'active';
    try {
      await update(collection, confirmation.id, { [key]: !confirmation[key] });
      setConfirmation(null);
      notify('Đã cập nhật trạng thái.');
    } catch (err) {
      setConfirmation(null);
      notify(err.message);
    }
  };
  // Đổi tìm kiếm hoặc trạng thái lọc thì quay về trang đầu tiên.
  const changeSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };
  const changeFilter = (event) => {
    setFilter(event.target.value);
    setPage(1);
  };
  // Lấy lịch sử đơn của khách đang được chọn trong hộp thoại.
  const historyBookings = data.bookings.filter((item) => item.userId === history?.id);
  // Giao diện EntityManager.jsx nhận dữ liệu và các hàm xử lý ở đây.
  return {
    data,
    title,
    search,
    changeSearch,
    filter,
    changeFilter,
    page,
    setPage,
    editing,
    setEditing,
    history,
    setHistory,
    confirmation,
    setConfirmation,
    fields,
    records,
    toggle,
    save,
    confirmToggle,
    historyBookings,
  };
}
