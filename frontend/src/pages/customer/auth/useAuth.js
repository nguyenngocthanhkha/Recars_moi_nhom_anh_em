import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../services/api';
import { navigate } from '../../../hooks/useLocation';

// Xác thực thật do backend xử lý; frontend không lưu hoặc kiểm tra mật khẩu thay server.
export default function useAuth({ type, params }) {
  // show bật/tắt xem mật khẩu; error giữ lỗi; busy khóa nút trong lúc gửi API.
  const { refresh, notify } = useApp();
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Một form dùng cho nhiều trang: các cờ này cho biết đang xử lý trang nào.
  const register = type === 'register',
    forgot = type === 'forgot-password',
    reset = type === 'reset-password';

  const submit = async (event) => {
    // Ngăn tải lại trang, đọc form rồi kiểm tra mật khẩu xác nhận nếu cần.
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setError('');
    if ((register || reset) && values.password !== values.confirm)
      return setError('Mật khẩu xác nhận chưa trùng khớp.');
    setBusy(true);
    try {
      if (forgot) {
        // Yêu cầu backend gửi email chứa liên kết đặt lại mật khẩu.
        const result = await api('/auth/forgot-password', { method: 'POST', body: values });
        notify(result.message);
      } else if (reset) {
        // Gửi token từ URL cùng mật khẩu mới; thành công thì về trang đăng nhập.
        const result = await api('/auth/reset-password', {
          method: 'POST',
          body: { token: params.get('token'), password: values.password },
        });
        notify(result.message);
        navigate('/login');
      } else {
        // Đăng ký/đăng nhập; backend cấp cookie rồi frontend tải lại tài khoản.
        await api(register ? '/auth/register' : '/auth/login', { method: 'POST', body: values });
        const fresh = await refresh();
        // Ưu tiên trang khách muốn quay lại; nếu không có thì đến Admin/tài khoản.
        const next = params.get('next');
        navigate(
          next?.startsWith('/') && !next.startsWith('//')
            ? next
            : fresh.user?.role === 'admin'
              ? '/admin'
              : '/account',
        );
        notify(register ? 'Đã tạo tài khoản.' : 'Đăng nhập thành công.');
      }
    } catch (err) {
      // Hiện thông báo từ API ngay trên form.
      setError(err.message);
    } finally {
      // Cho phép thao tác lại sau khi yêu cầu đã kết thúc.
      setBusy(false);
    }
  };
  // Auth.jsx nhận các cờ, trạng thái và hàm gửi form ở đây.
  return { show, setShow, error, busy, register, forgot, reset, submit };
}
