import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { isAvailable } from '../../../utils/booking';

// Hook quản lý dữ liệu và sự kiện; không chứa mã hiển thị JSX.
export default function useCars({ params }) {
  // Lấy dữ liệu xe; lưu các lựa chọn lọc, sắp xếp và số trang hiện tại.
  const { data } = useApp();
  const [brand, setBrand] = useState('');
  const [type, setType] = useState('');
  const [seats, setSeats] = useState('');
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  // Đọc ngày thuê và hình thức thuê được truyền từ form tìm xe qua URL.
  const start = params.get('start'),
    end = params.get('end'),
    mode = params.get('mode');
  // Mỗi điều kiện && phải đúng; bộ lọc rỗng nghĩa là chấp nhận mọi giá trị.
  const filtered = data.cars.filter(
    (car) =>
      car.active &&
      (!brand || car.brand === brand) &&
      (!type || car.type === type) &&
      (!seats || car.seats === Number(seats)) &&
      car.price <= maxPrice &&
      (!mode || car.modes.includes(mode)) &&
      (!onlyAvailable || !start || !end || isAvailable(data.availability, car.id, start, end)),
  );
  // Sao chép trước khi sắp xếp giá: asc tăng dần, desc giảm dần.
  const sorted = [...filtered].sort((a, b) =>
    sort === 'asc' ? a.price - b.price : sort === 'desc' ? b.price - a.price : 0,
  );
  // Nút xóa bộ lọc đưa hãng/loại/số chỗ/giá và trang về giá trị ban đầu.
  const reset = () => {
    setBrand('');
    setType('');
    setSeats('');
    setMaxPrice(5000000);
    setPage(1);
  };

  // Bộ lọc thay đổi luôn quay về trang đầu để không hiển thị trang trống.
  const changeFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };
  // Set loại hãng trùng nhau; slice chỉ lấy 6 xe cho trang đang xem.
  const brands = [...new Set(data.cars.map((car) => car.brand))];
  const visibleCars = sorted.slice((page - 1) * 6, page * 6);
  // Gửi danh sách đã lọc và các hàm điều khiển cho Cars.jsx.
  return {
    brands,
    brand,
    setBrand,
    type,
    setType,
    seats,
    setSeats,
    maxPrice,
    setMaxPrice,
    sort,
    setSort,
    page,
    setPage,
    onlyAvailable,
    setOnlyAvailable,
    filtered,
    visibleCars,
    reset,
    changeFilter,
  };
}
