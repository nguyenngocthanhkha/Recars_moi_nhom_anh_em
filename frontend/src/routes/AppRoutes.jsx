import { useLocation } from '../hooks/useLocation';
import CustomerLayout from '../layouts/CustomerLayout';
import Home from '../pages/customer/home/Home';
import Cars from '../pages/customer/cars/Cars';
import CarDetail from '../pages/customer/cars/CarDetail';
import Booking from '../pages/customer/bookings/Booking';
import Payment from '../pages/customer/payments/Payment';
import Auth from '../pages/customer/auth/Auth';
import Account from '../pages/customer/account/Account';
import Admin from '../pages/admin/Admin';
import Info from '../pages/customer/Info';

// Chọn trang theo URL; bố cục và xử lý của trang nằm trong các component riêng.
export default function AppRoutes() {
  // Ví dụ /cars/santafe: root là cars, id là santafe; params chứa bộ lọc sau dấu ?.
  const { path, params } = useLocation();
  const [, root, id] = path.split('/');
  // Các đường dẫn /admin/... dùng khung quản trị riêng.
  if (root === 'admin') return <Admin section={id || 'dashboard'} />;
  // Chọn thành phần giao diện tương ứng với trang chủ, xe, đặt xe hoặc tài khoản.
  let page;
  if (path === '/') page = <Home />;
  else if (root === 'cars')
    page = id ? (
      <CarDetail key={`${id}-${params}`} id={id} params={params} />
    ) : (
      <Cars params={params} />
    );
  else if (root === 'booking') page = <Booking key={id} id={id} params={params} />;
  else if (['payment', 'payment-result'].includes(root))
    page = (
      <Payment key={`${root}-${id}`} id={id} result={root === 'payment-result'} params={params} />
    );
  else if (['login', 'register', 'forgot-password', 'reset-password'].includes(root))
    page = <Auth key={root} type={root} params={params} />;
  else if (root === 'account') page = <Account key={id || 'profile'} section={id || 'profile'} />;
  else page = <Info type={root} />;
  // Ghép trang khách hàng vừa chọn vào khung có header và footer.
  return <CustomerLayout path={path}>{page}</CustomerLayout>;
}
