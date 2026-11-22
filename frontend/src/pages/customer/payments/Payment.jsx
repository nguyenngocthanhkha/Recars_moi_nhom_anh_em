import { Button, Empty, Link, PageTitle, Confirm, Icon } from '../../../components/common/UI';
import CostSummary from '../../../components/customer/CostSummary';
import { money, shortDate } from '../../../utils/booking';
import { modeNames } from '../../../constants/data';
import usePayment from './usePayment';

// Kết quả lấy từ backend; truy cập URL thành công không tự ghi nhận tiền cọc.
export default function Payment({ id, result = false, params }) {
  const {
    confirm,
    setConfirm,
    busy,
    order,
    success,
    pending,
    pay,
    error,
    configured,
    refreshStatus,
  } = usePayment({ id, params });
  // Không tìm thấy đơn của khách hiện tại thì hướng về danh sách đơn của họ.
  if (!order)
    return (
      <div className="container page">
        <Empty title="Không tìm thấy đơn thuê">
          <Link to="/account/bookings" className="btn">
            Đơn thuê của tôi
          </Link>
        </Empty>
      </div>
    );
  // result=true khi khách quay lại từ cổng thanh toán; dữ liệu cọc vẫn lấy từ backend.
  if (result)
    return (
      <div className="container page">
        <div className="panel result-panel">
          <span className={`result-icon ${success ? 'success' : pending ? '' : 'failure'}`}>
            {success ? (
              <Icon name="check" size={38} />
            ) : pending ? (
              <Icon name="clock" size={38} />
            ) : (
              '×'
            )}
          </span>
          <span className="eyebrow">KẾT QUẢ THANH TOÁN VNPAY</span>
          {/* Tiêu đề đổi theo trạng thái đã cọc, chờ IPN hoặc chưa thanh toán xong. */}
          <h1>
            {success
              ? 'Đã thanh toán tiền cọc!'
              : pending
                ? 'Đang chờ xác nhận thanh toán'
                : 'Thanh toán chưa hoàn tất'}
          </h1>
          <p>
            {success
              ? 'Tiền cọc đã được xác nhận. Theo dõi đơn thuê để cập nhật chuyến đi.'
              : pending
                ? 'Hệ thống đang chờ thông báo xác nhận từ VNPAY. Bạn có thể kiểm tra lại trạng thái.'
                : 'Chưa có tiền cọc được xác nhận cho đơn này. Bạn có thể thử lại nếu đơn còn hiệu lực.'}
          </p>
          {/* Tóm tắt mã đơn, cọc đã được xác nhận và phần tiền còn lại. */}
          <div className="result-details">
            {[
              ['Mã đơn thuê', id],
              ['Đã thanh toán cọc', money(order.depositPaid ? order.deposit : 0)],
              ['Còn lại', money(order.remaining)],
            ].map(([label, value]) => (
              <div key={label} className="summary-row">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {/* Kiểm tra lại chỉ tải API; nút thử lại chỉ hiện khi đơn vẫn chờ cọc. */}
          <div className="actions">
            {!success && <Button onClick={refreshStatus}>Kiểm tra trạng thái</Button>}
            {!success && !pending && order.status === 'pending' && (
              <Link to={`/payment/${id}`} className="btn">
                Thử lại thanh toán
              </Link>
            )}
            <Link to="/account/bookings" className="btn outline">
              Xem đơn thuê
            </Link>
            <Link to="/" className="text-link">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  return (
    <div className="container page">
      <PageTitle
        eyebrow="BƯỚC CUỐI ĐỂ GIỮ XE"
        title="Thanh toán tiền cọc"
        text="Kiểm tra thông tin và chi phí trước khi chuyển đến VNPAY."
      />
      {/* Thông báo môi trường Sandbox hoặc trạng thái thiếu cấu hình từ backend. */}
      <div className="notice">
        {configured
          ? 'Giao dịch sử dụng môi trường VNPAY Sandbox. Chỉ dùng thông tin thanh toán thử nghiệm được VNPAY cung cấp.'
          : 'VNPAY Sandbox chưa được cấu hình. Đơn đã được lưu; vui lòng liên hệ quản trị viên để được hỗ trợ trước thời hạn giữ xe.'}
      </div>
      <div className="detail-layout">
        {/* Cột trái hiển thị thông tin đơn khách chuẩn bị thanh toán. */}
        <section className="panel">
          <h2>Thông tin đơn thuê</h2>
          <div className="order-facts">
            {[
              ['Mã đơn', id],
              ['Xe', order.carName],
              ['Hình thức', modeNames[order.mode]],
              ['Ngày nhận', shortDate(order.start)],
              ['Ngày trả', shortDate(order.end)],
              ['Nơi nhận', order.location],
              ['Người thuê', order.name],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="payment-method">
            <span className="vnpay">
              <b>VN</b>PAY
            </span>
            <div>
              <strong>Cổng thanh toán VNPAY Sandbox</strong>
              <p>Tiền cọc được xác nhận qua thông báo từ cổng thanh toán.</p>
            </div>
            <Icon name="shield" size={30} />
          </div>
          <p className="muted">Hạn giữ xe: {new Date(order.expiresAt).toLocaleString('vi-VN')}.</p>
        </section>
        {/* Cột phải hiển thị chi phí; nút thanh toán gọi hook khi đã xác nhận. */}
        <aside className="panel">
          <h2>Chi tiết thanh toán</h2>
          <CostSummary cost={order} />
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {order.status === 'pending' ? (
            <Button
              className="full"
              disabled={busy || !configured}
              onClick={() => setConfirm(true)}
            >
              {busy ? 'Đang chuyển đến VNPAY…' : 'Thanh toán qua VNPAY'}
            </Button>
          ) : (
            <>
              <p className="notice">
                {order.depositPaid ? 'Đơn đã thanh toán cọc.' : 'Đơn đã hết hạn hoặc bị hủy.'}
              </p>
              <Link to="/account/bookings" className="btn full">
                Xem đơn thuê
              </Link>
            </>
          )}
        </aside>
      </div>
      {/* Hỏi khách xác nhận số tiền trước khi chuyển sang website VNPAY. */}
      {confirm && (
        <Confirm
          title="Chuyển đến VNPAY Sandbox"
          text={`Thanh toán tiền cọc ${money(order.deposit)} cho đơn ${id}?`}
          onClose={() => setConfirm(false)}
          onConfirm={pay}
        />
      )}
    </div>
  );
}
