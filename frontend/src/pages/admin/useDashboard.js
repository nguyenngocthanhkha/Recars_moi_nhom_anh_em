import { useApp } from '../../context/AppContext';
import { money } from '../../utils/booking';

// Hook quản lý dữ liệu và sự kiện; không chứa mã hiển thị JSX.
export default function useDashboard() {
  const { data } = useApp();
  const orders = data.bookings;
  // Cộng cọc đã xác nhận và tiền còn lại đã ghi nhận của từng đơn để hiển thị thống kê.
  const revenue = orders.reduce(
    (sum, b) => sum + (b.depositPaid ? b.deposit : 0) + (b.balancePaid ? b.remaining : 0),
    0,
  );
  // Mỗi dòng tạo một ô thống kê gồm biểu tượng, tên chỉ số và giá trị.
  const stats = [
    ['car', 'Tổng số xe', data.cars.length],
    ['user', 'Khách hàng', data.users.filter((user) => user.role === 'customer').length],
    ['calendar', 'Tổng đơn thuê', orders.length],
    ['clock', 'Đơn chờ xử lý', orders.filter((b) => ['pending', 'paid'].includes(b.status)).length],
    ['car', 'Đơn đang thuê', orders.filter((b) => b.status === 'renting').length],
    ['wallet', 'Tiền đã ghi nhận', money(revenue)],
  ];
  // Tạo 6 tháng gần nhất; đếm đơn theo tháng và năm tạo để dựng biểu đồ.
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 5 + i);
    return {
      label: `T${date.getMonth() + 1}`,
      count: orders.filter((b) => {
        const created = new Date(b.createdAt);
        return (
          created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear()
        );
      }).length,
    };
  });
  // Lấy cột cao nhất làm mốc; ít nhất bằng 1 để không chia cho 0 khi chưa có đơn.
  const maximum = Math.max(1, ...monthly.map((m) => m.count));

  // Đếm những công việc Admin cần theo dõi: chờ xác nhận, thiếu tài xế và hết hạn.
  const tasks = [
    ['Chờ xác nhận sau cọc', orders.filter((order) => order.status === 'paid').length],
    [
      'Chờ phân công tài xế',
      orders.filter(
        (order) =>
          order.mode === 'driver' &&
          order.depositPaid &&
          !order.driverId &&
          ['paid', 'confirmed'].includes(order.status),
      ).length,
    ],
    ['Đơn đã hết hạn', orders.filter((order) => order.status === 'expired').length],
  ];
  // API đã sắp xếp đơn mới trước; lấy 5 đơn đầu cho bảng gần đây.
  const recentOrders = orders.slice(0, 5);
  return { stats, monthly, maximum, tasks, recentOrders };
}
