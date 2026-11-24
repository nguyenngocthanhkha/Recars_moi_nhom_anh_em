import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../services/api';

// Trình duyệt chỉ chuyển sang VNPAY; IPN đã xác minh ở backend mới ghi nhận tiền.
export default function usePayment({ id, params }) {
  // confirm mở hộp xác nhận; busy khóa nút; error giữ thông báo lỗi.
  const { data, refresh } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Chỉ lấy đơn thuộc khách đang đăng nhập; kết quả cọc lấy từ dữ liệu backend.
  const order = data.bookings.find((item) => item.id === id && item.userId === data.user?.id);
  const success = Boolean(order?.depositPaid);
  const pending = !success && order?.status === 'pending' && params.get('status') === 'pending';
  // Xin URL đã ký từ backend rồi chuyển trình duyệt sang cổng VNPAY.

const pay = async () => {
  setConfirm(false);
  setBusy(true);
  setError('');

  try {
    const result = await api('/payments/sepay-checkout', {
      method: 'POST',
      body: { bookingId: id },
    });

    if (!result.checkoutURL || !result.checkoutFormfields) {
      throw new Error('Dữ liệu thanh toán SePay không hợp lệ.');
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = result.checkoutURL;
    form.style.display = 'none';

    Object.entries(result.checkoutFormfields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
    });

      document.body.appendChild(form);
      form.submit();
      }catch (err) {
      setError(err.message);
      setBusy(false);
       }
    };
  // Nút kiểm tra trạng thái chỉ tải lại dữ liệu, không tự đánh dấu đã thanh toán.
  const refreshStatus = async () => {
    try {
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };
  // Trả dữ liệu và sự kiện cho Payment.jsx dựng màn hình thanh toán/kết quả.
  return {
    confirm,
    setConfirm,
    busy,
    order,
    success,
    pending,
    pay,
    error,
    configured: data.paymentConfigured,
    refreshStatus,
  };
}
