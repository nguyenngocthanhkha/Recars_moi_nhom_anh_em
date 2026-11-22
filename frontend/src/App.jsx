// AppProvider chia sẻ dữ liệu; AppRoutes chọn trang theo địa chỉ đang mở.
import { AppProvider } from './context/AppContext';
import AppRoutes from './routes/AppRoutes';

// Điểm ghép dữ liệu dùng chung và các trang; định tuyến nằm trong routes/.
export default function App() {
  // Bọc các trang trong AppProvider để chúng dùng được tài khoản, xe và đơn thuê.
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
