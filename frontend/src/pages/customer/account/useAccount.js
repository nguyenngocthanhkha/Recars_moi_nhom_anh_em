import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../services/api';
import { navigate } from '../../../hooks/useLocation';

// Hồ sơ, đơn và đánh giá được ghi qua API, không sửa quyền hay thanh toán ở frontend.
export default function useAccount({ section = 'profile' }) {
  // Nhận tài khoản/dữ liệu chung; lưu đơn đang xem, hủy hoặc đánh giá trong hộp thoại.
  const { data, refresh, update, add, notify } = useApp();
  const [detailItem, setDetail] = useState(null);
  const [cancel, setCancel] = useState(null);
  const [review, setReview] = useState(null);
  const [filter, setFilter] = useState('');
  const user = data.user;
  // Chỉ hiển thị đơn của người đang đăng nhập; lịch sử gồm đơn đã kết thúc.
  const orders = data.bookings.filter((item) => item.userId === user?.id);
  const list = orders.filter(
    (item) =>
      (section !== 'history' || ['completed', 'cancelled', 'expired'].includes(item.status)) &&
      (!filter || item.status === filter),
  );
  // Tiêu đề thay đổi theo mục tài khoản đang mở.
  const titles = {
    profile: 'Thông tin cá nhân',
    bookings: 'Đơn thuê của tôi',
    history: 'Lịch sử thuê xe',
    reviews: 'Đánh giá của tôi',
  };
  // Dùng phiên bản đơn mới nhất khi dữ liệu được tải lại trong lúc xem chi tiết.
  const detail = data.bookings.find((item) => item.id === detailItem?.id) || detailItem;

  // Gửi họ tên/số điện thoại qua API rồi tải lại để cập nhật màn hình.
  const saveProfile = async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api('/auth/profile', { method: 'PATCH', body });
      await refresh();
      notify('Đã cập nhật hồ sơ.');
    } catch (err) {
      notify(err.message);
    }
  };
  // Kiểm tra xác nhận mật khẩu trước; backend kiểm tra mật khẩu cũ và lưu mật khẩu mới.
  const changePassword = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    if (body.newPassword !== body.confirm) return notify('Mật khẩu xác nhận chưa trùng khớp.');
    try {
      await api('/auth/change-password', { method: 'POST', body });
      form.reset();
      notify('Đã đổi mật khẩu và làm mới phiên đăng nhập.');
    } catch (err) {
      notify(err.message);
    }
  };
  // Đọc số sao/nội dung và gửi đánh giá; backend kiểm tra chủ đơn, hoàn thành và trùng đánh giá.
  const saveReview = async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await add('reviews', { bookingId: review.id, text: body.text, stars: Number(body.stars) });
      setReview(null);
      notify('Đã gửi đánh giá.');
    } catch (err) {
      notify(err.message);
    }
  };
  // Thu hồi phiên ở backend, tải lại dữ liệu khách và chuyển về trang chủ.
  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
      await refresh();
      navigate('/');
      notify('Đã đăng xuất.');
    } catch (err) {
      notify(err.message);
    }
  };
  // Chỉ gọi khi khách xác nhận hủy trong hộp thoại; trạng thái do backend quyết định.
  const cancelOrder = async () => {
    try {
      await update('bookings', cancel.id, { status: 'cancelled' });
      setCancel(null);
      notify('Đã hủy đơn. Đơn đã cọc cần quản trị viên đối soát hoàn tiền.');
    } catch (err) {
      notify(err.message);
    }
  };
  // Chuẩn bị đánh giá cá nhân, mã đơn đã đánh giá và tên tài xế để giao diện hiển thị.
  const ownReviews = data.reviews.filter((item) => item.userId === user?.id);
  const reviewedIds = new Set(data.reviews.map((item) => item.bookingId));
  const driverName = data.drivers.find((item) => item.id === detail?.driverId)?.name;
  // Account.jsx nhận dữ liệu và nối các hàm trên vào nút/form tương ứng.
  return {
    data,
    detail,
    setDetail,
    cancel,
    setCancel,
    review,
    setReview,
    filter,
    setFilter,
    user,
    list,
    titles,
    saveProfile,
    saveReview,
    logout,
    cancelOrder,
    changePassword,
    ownReviews,
    reviewedIds,
    driverName,
  };
}
