import { useState } from 'react';
import { useApp } from '../../context/AppContext';

// Hook quản lý dữ liệu và sự kiện; không chứa mã hiển thị JSX.
export default function useAdminBookings() {
  // Lấy đơn từ dữ liệu chung; lưu tìm kiếm, bộ lọc, trang và đơn đang xem chi tiết.
  const { data, update, notify } = useApp();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);
  // Tìm đơn đang chọn rồi lọc danh sách theo trạng thái và nội dung tìm kiếm.
  const orders = data.bookings;
  const order = orders.find((b) => b.id === selected);
  const filtered = orders.filter(
    (b) =>
      (!status || b.status === status) &&
      `${b.id} ${b.name} ${b.carName}`.toLowerCase().includes(search.toLowerCase()),
  );
  // Chuẩn bị thay đổi trong hộp xác nhận, chưa gọi API ở bước này.
  const change = (patch, title) => setConfirm({ patch, title });
  // Tài xế chỉ được phân công sau cọc và không được trùng lịch với đơn khác.
  const assignDriver = async (driverId) => {
    if (
      !order.depositPaid ||
      order.mode !== 'driver' ||
      !['paid', 'confirmed'].includes(order.status)
    )
      return notify('Chỉ phân công cho đơn có tài xế đã cọc và chưa khởi hành.');
    // Kiểm tra nhanh lịch tài xế trên màn hình; backend bảo vệ xung đột khi ghi.
    const conflict =
      driverId &&
      orders.some(
        (b) =>
          b.id !== order.id &&
          b.driverId === driverId &&
          !['cancelled', 'expired', 'completed'].includes(b.status) &&
          order.start < b.end &&
          order.end > b.start,
      );
    if (conflict) return notify('Tài xế đã có lịch trong khoảng ngày này.');
    // Gửi yêu cầu phân công; lỗi từ backend sẽ được hiện bằng thông báo.
    try {
      await update('bookings', order.id, { driverId });
      notify('Đã cập nhật phân công tài xế.');
    } catch (err) {
      notify(err.message);
    }
  };

  // Chỉ ghi thay đổi khi người quản trị xác nhận hộp thoại.
  const confirmChange = async () => {
    try {
      await update('bookings', order.id, confirm.patch);
      setConfirm(null);
      notify('Đã cập nhật đơn thuê.');
    } catch (err) {
      setConfirm(null);
      notify(err.message);
    }
  };
  // Thay tìm kiếm/bộ lọc thì quay về trang đầu, tránh hiện trang danh sách trống.
  const changeSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };
  const changeStatus = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };
  // Mỗi nút ở view gọi một hành động có tên, không tự đặt trạng thái nghiệp vụ.
  const confirmBooking = () => change({ status: 'confirmed' }, 'Xác nhận đơn thuê');
  const handOverCar = () => change({ status: 'renting' }, 'Bắt đầu chuyến đi');
  const completeBooking = () => change({ status: 'completed' }, 'Hoàn thành chuyến đi');
  const recordBalance = () => change({ balancePaid: true }, 'Ghi nhận tiền còn lại');
  const cancelBooking = () => change({ status: 'cancelled' }, 'Hủy đơn thuê');
  // Cho chọn tài xế hoạt động và vẫn hiện tài xế hiện tại của đơn nếu đã ngừng hoạt động.
  const availableDrivers = data.drivers.filter(
    (driver) => driver.active || driver.id === order?.driverId,
  );
  // AdminBookings.jsx dùng dữ liệu và các hàm có tên để nối vào từng nút quản lý.
  return {
    data,
    search,
    changeSearch,
    status,
    changeStatus,
    page,
    setPage,
    selected,
    setSelected,
    confirm,
    setConfirm,
    order,
    filtered,
    assignDriver,
    confirmChange,
    confirmBooking,
    handOverCar,
    completeBooking,
    recordBalance,
    cancelBooking,
    availableDrivers,
  };
}
