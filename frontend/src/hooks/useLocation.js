import { useEffect, useState } from 'react';

// Hash routing không cần cấu hình lại máy chủ khi mở đường dẫn con.
export const navigate = (path) => {
  // Thay phần sau dấu # trên URL để chuyển trang mà không tải lại toàn bộ HTML.
  window.location.hash = path;
};
export function useLocation() {
  // Đọc trang ban đầu; URL chưa có # thì xem như đang ở trang chủ /.
  const read = () => window.location.hash.slice(1) || '/';
  const [location, setLocation] = useState(read);
  // Theo dõi thay đổi URL, cập nhật trang và cuộn lên đầu; gỡ sự kiện khi rời đi.
  useEffect(() => {
    const update = () => {
      setLocation(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  // Tách đường dẫn và bộ lọc, ví dụ /cars?mode=self.
  const [path, query = ''] = location.split('?');
  return { path, params: new URLSearchParams(query) };
}
