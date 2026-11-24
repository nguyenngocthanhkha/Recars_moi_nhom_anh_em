
import {
  Button,
  Empty,
  Link,
  PageTitle,
  Confirm,
  Icon,
} from '../../../components/common/UI';

import CostSummary from '../../../components/customer/CostSummary';
import { money, shortDate } from '../../../utils/booking';
import { modeNames } from '../../../constants/data';
import usePayment from './usePayment';

// Kết quả thanh toán được xác nhận dựa trên dữ liệu backend và IPN SePay.
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
    refreshStatus,
  } = usePayment({ id, params });

  // Không tìm thấy đơn của khách hiện tại.
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

  // Màn hình kết quả thanh toán.
  if (result)
    return (
      <div className="container page">
        <div className="panel result-panel">
          <span
            className={`result-icon ${
              success ? 'success' : pending ? '' : 'failure'
            }`}
          >
            {success ? (
              <Icon name="check" size={38} />
            ) : pending ? (
              <Icon name="clock" size={38} />
            ) : (
              '×'
            )}
          </span>

          <span className="eyebrow">KẾT QUẢ THANH TOÁN SEPAY</span>

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
                ? 'Hệ thống đang chờ thông báo xác nhận từ SePay. Bạn có thể kiểm tra lại trạng thái.'
                : 'Chưa có tiền cọc được xác nhận cho đơn này. Bạn có thể thử lại nếu đơn còn hiệu lực.'}
          </p>

          <div className="result-details">
            {[
              ['Mã đơn thuê', id],
              [
                'Đã thanh toán cọc',
                money(order.depositPaid ? order.deposit : 0),
              ],
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

          <div className="actions">
            {!success && (
              <Button onClick={refreshStatus}>
                Kiểm tra trạng thái
              </Button>
            )}

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

  // Màn hình thanh toán tiền cọc.
  return (
    <div className="container page">
      <PageTitle
        eyebrow="BƯỚC CUỐI ĐỂ GIỮ XE"
        title="Thanh toán tiền cọc"
        text="Kiểm tra thông tin và chi phí trước khi chuyển đến SePay."
      />

      <div className="notice">
        Giao dịch sử dụng môi trường SePay Sandbox để kiểm thử thanh toán.
        Chỉ sử dụng thông tin giao dịch thử nghiệm.
      </div>

      <div className="detail-layout">
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
              <b>Se</b>Pay
            </span>

            <div>
              <strong>Cổng thanh toán SePay Sandbox</strong>
              <p>
                Tiền cọc được xác nhận qua thông báo IPN từ SePay.
              </p>
            </div>

            <Icon name="shield" size={30} />
          </div>

          <p className="muted">
            Hạn giữ xe:{' '}
            {new Date(order.expiresAt).toLocaleString('vi-VN')}.
          </p>
        </section>

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
              disabled={busy}
              onClick={() => setConfirm(true)}
            >
              {busy
                ? 'Đang chuyển đến SePay…'
                : 'Thanh toán qua SePay'}
            </Button>
          ) : (
            <>
              <p className="notice">
                {order.depositPaid
                  ? 'Đơn đã thanh toán cọc.'
                  : 'Đơn đã hết hạn hoặc bị hủy.'}
              </p>

              <Link to="/account/bookings" className="btn full">
                Xem đơn thuê
              </Link>
            </>
          )}
        </aside>
      </div>

      {confirm && (
        <Confirm
          title="Chuyển đến SePay Sandbox"
          text={`Thanh toán tiền cọc ${money(order.deposit)} cho đơn ${id}?`}
          onClose={() => setConfirm(false)}
          onConfirm={pay}
        />
      )}
    </div>
  );
}
