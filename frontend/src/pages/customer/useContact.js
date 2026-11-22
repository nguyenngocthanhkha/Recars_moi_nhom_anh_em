import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { useState } from 'react';

// Gửi biểu mẫu liên hệ đến backend; backend gửi email khi đã có cấu hình SMTP.
export default function useContact() {
  const { data, notify } = useApp();
  // busy giúp khóa nút gửi trong lúc đang chờ backend phản hồi.
  const [busy, setBusy] = useState(false);
  const submitContact = async (event) => {
    // Đọc họ tên/email/nội dung từ form và ngăn trình duyệt tải lại trang.
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    setBusy(true);
    try {
      // Chỉ xóa nội dung form khi API báo đã gửi thành công.
      const result = await api('/contact', { method: 'POST', body });
      notify(result.message);
      form.reset();
    } catch (err) {
      notify(err.message);
    } finally {
      setBusy(false);
    }
  };
  // Trang liên hệ dùng configured để biết có thể gửi email hay chưa.
  return {
    submitContact,
    busy,
    contactEmail: data.contactEmail,
    configured: Boolean(data.contactEmail && data.mailConfigured),
  };
}
