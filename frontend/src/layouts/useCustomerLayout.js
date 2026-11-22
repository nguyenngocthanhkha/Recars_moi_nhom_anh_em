import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { navigate } from '../hooks/useLocation';

// Hook quản lý dữ liệu và sự kiện; không chứa mã hiển thị JSX.
export default function useCustomerLayout({ children, path }) {
  // Lấy tài khoản; open ghi menu điện thoại đang mở hay đóng.
  const { data, refresh, notify } = useApp();
  const [open, setOpen] = useState(false);
  // Các liên kết dùng cho menu đầu trang và chân trang.
  const links = [
    ['/', 'Trang chủ'],
    ['/cars', 'Danh sách xe'],
    ['/about', 'Giới thiệu'],
    ['/contact', 'Liên hệ'],
  ];

  // Yêu cầu backend thu hồi phiên, tải lại dữ liệu rồi đưa khách về trang chủ.
  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
      await refresh();
      navigate('/');
    } catch (err) {
      notify(err.message);
    }
  };
  return { data, open, setOpen, links, logout };
}
