import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { navigate } from '../../hooks/useLocation';

// Kiểm tra để hiển thị khu vực Admin; backend vẫn kiểm tra quyền ở mọi API quản trị.
export default function useAdminAccess() {
  const { data, refresh, notify } = useApp();
  // Mở đăng nhập và ghi nhớ /admin là trang cần quay lại sau khi đăng nhập.
  const enter = () => navigate('/login?next=/admin');
  // Đăng xuất thật qua backend, làm mới tài khoản và quay về màn hình đăng nhập.
  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
      await refresh();
      navigate('/login');
    } catch (err) {
      notify(err.message);
    }
  };
  // entered=true chỉ khi tài khoản trong phiên hiện tại có vai trò admin.
  return { entered: data.user?.role === 'admin', enter, user: data.user, logout };
}
