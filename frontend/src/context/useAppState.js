import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

// Dữ liệu ban đầu trước khi tải API; mỗi danh sách bắt đầu rỗng.
const empty = {
  cars: [],
  drivers: [],
  users: [],
  bookings: [],
  reviews: [],
  payments: [],
  availability: [],
  user: null,
  paymentConfigured: false,
};

// Dữ liệu lấy từ backend/MongoDB. Phiên đăng nhập nằm trong cookie HttpOnly.
export default function useAppState() {
  // data: dữ liệu chung; toast: thông báo; loading/error: trạng thái tải dữ liệu.
  const [data, setData] = useState(empty);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Số thứ tự tăng theo mỗi lần tải, giúp nhận diện phản hồi cũ.
  const sequence = useRef(0);

  // Bỏ qua response cũ nếu có request mới hơn, tránh ghi đè trạng thái đăng nhập.
  const refresh = useCallback(async () => {
    const request = ++sequence.current;
    try {
      // Backend trả xe, đơn và tài khoản phù hợp với quyền của phiên đăng nhập.
      const result = await api('/bootstrap');
      if (request === sequence.current) {
        setData(result);
        setError('');
      }
      return result;
    } catch (err) {
      if (request === sequence.current) setError(err.message);
      throw err;
    } finally {
      if (request === sequence.current) setLoading(false);
    }
  }, []);

  // Tải khi mở ứng dụng, tải lại mỗi 15 giây và khi người dùng quay về tab.
  useEffect(() => {
    const reload = () => {
      refresh().catch(() => {});
    };
    reload();
    const timer = setInterval(reload, 15000);
    window.addEventListener('focus', reload);
    // Khi ngừng dùng, gỡ bộ hẹn giờ và sự kiện để tránh chạy lặp ngoài ý muốn.
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', reload);
      sequence.current += 1;
    };
  }, [refresh]);
  // Mỗi thông báo tự đóng sau 5 giây; xóa hẹn giờ cũ nếu thông báo thay đổi.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Ghi dữ liệu qua API rồi đọc lại; không thay đổi đơn/tiền cọc bằng state cục bộ.
  const add = async (collection, body) => {
    // Đơn/đánh giá dùng API khách hàng; danh mục xe/tài xế dùng API Admin.
    const path = ['bookings', 'reviews'].includes(collection)
      ? `/${collection}`
      : `/admin/${collection}`;
    const result = await api(path, { method: 'POST', body });
    // Giữ response đã ghi thành công nếu lần tải lại sau đó bị mất mạng.
    setData((old) => ({ ...old, [collection]: [result, ...old[collection]] }));
    await refresh().catch(() => {});
    return result;
  };
  // Sửa bản ghi qua PATCH, cập nhật màn hình rồi tải lại dữ liệu từ backend.
  const update = async (collection, id, body) => {
    const path = collection === 'bookings' ? `/bookings/${id}` : `/admin/${collection}/${id}`;
    const result = await api(path, { method: 'PATCH', body });
    setData((old) => ({
      ...old,
      [collection]: old[collection].map((item) => (item.id === id ? result : item)),
    }));
    await refresh().catch(() => {});
    return result;
  };
  // AppContext chia sẻ những giá trị và hàm này cho các trang bên trong App.
  return {
    data,
    refresh,
    add,
    update,
    notify: setToast,
    toast,
    dismissToast: () => setToast(''),
    loading,
    error,
  };
}
