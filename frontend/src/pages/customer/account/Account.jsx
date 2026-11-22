import {
  Badge,
  Button,
  Confirm,
  Empty,
  Field,
  Icon,
  Link,
  Modal,
  PageTitle,
} from '../../../components/common/UI';
import { modeNames } from '../../../constants/data';
import { money, shortDate } from '../../../utils/booking';
import useAccount from './useAccount';

// Sidebar tài khoản giữ các màn hình cá nhân trong cùng một bố cục.

export default function Account({ section = 'profile' }) {
  // Nhận dữ liệu và hàm xử lý từ hook, bên dưới chỉ dựng giao diện.
  const {
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
  } = useAccount({ section });
  // Chưa có tài khoản đăng nhập thì chỉ hiện lời mời đăng nhập.
  if (!data.user)
    return (
      <div className="container page">
        <Empty title="Bạn chưa đăng nhập">
          <Link to="/login" className="btn">
            Đăng nhập
          </Link>
        </Empty>
      </div>
    );

  return (
    <div className="container page">
      <PageTitle eyebrow="GÓC CỦA BẠN" title="Mỗi chuyến đi, một câu chuyện" />
      <div className="account-layout">
        {/* Menu bên trái đổi giữa hồ sơ, đơn thuê, lịch sử và đánh giá. */}
        <aside className="panel account-nav">
          <span className="avatar large">{user.name.charAt(0)}</span>
          <h3>{user.name}</h3>
          <p className="muted small-text">{user.email}</p>
          {[
            ['profile', 'user'],
            ['bookings', 'calendar'],
            ['history', 'clock'],
            ['reviews', 'star'],
          ].map(([key, icon]) => (
            <Link
              key={key}
              to={key === 'profile' ? '/account' : `/account/${key}`}
              className={section === key ? 'active' : ''}
            >
              <Icon name={icon} size={18} />
              {titles[key]}
            </Link>
          ))}
          <button onClick={logout}>Đăng xuất</button>
        </aside>
        <section>
          <h2>{titles[section] || titles.profile}</h2>
          {/* section quyết định nội dung bên phải; profile hiển thị hai form cá nhân. */}
          {section === 'profile' ? (
            <div className="panel">
              {/* Lưu họ tên và số điện thoại qua saveProfile trong useAccount.js. */}
              <form onSubmit={saveProfile}>
                <div className="form-grid">
                  <Field
                    label="Họ và tên"
                    name="name"
                    defaultValue={user.name}
                    required
                    maxLength={80}
                  />
                  <Field label="Email" type="email" value={user.email} readOnly />
                  <Field
                    label="Số điện thoại"
                    name="phone"
                    type="tel"
                    defaultValue={user.phone}
                    pattern="0[0-9]{9}"
                    required
                  />
                  <Field label="Ngày tạo tài khoản" value={shortDate(user.createdAt)} readOnly />
                </div>
                <Button>Lưu thay đổi</Button>
              </form>
              <hr />
              <h3>Đổi mật khẩu</h3>
              {/* Gửi mật khẩu hiện tại, mật khẩu mới và xác nhận cho hook kiểm tra. */}
              <form onSubmit={changePassword}>
                <Field
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  type="password"
                  required
                  maxLength={128}
                  autoComplete="current-password"
                />
                <div className="form-grid">
                  <Field
                    label="Mật khẩu mới"
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                  <Field
                    label="Xác nhận mật khẩu mới"
                    name="confirm"
                    type="password"
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </div>
                <Button variant="outline">Đổi mật khẩu</Button>
              </form>
            </div>
          ) : section === 'reviews' ? (
            <div className="review-list">
              {/* Chỉ hiển thị đánh giá của khách đang đăng nhập, kể cả đánh giá bị ẩn. */}
              {ownReviews.length ? (
                ownReviews.map((r) => (
                  <article key={r.id} className="panel">
                    <h3>{data.cars.find((c) => c.id === r.carId)?.name}</h3>
                    <span className="stars">{'★'.repeat(r.stars)}</span>
                    <p>{r.text}</p>
                    <small className="muted">
                      {r.visible ? 'Đang hiển thị' : 'Đã được quản trị viên ẩn'}
                    </small>
                  </article>
                ))
              ) : (
                <Empty
                  title="Bạn chưa có đánh giá"
                  text="Bạn có thể đánh giá sau khi hoàn thành chuyến đi."
                >
                  <Link to="/account/history" className="btn outline">
                    Xem chuyến đi đã hoàn thành
                  </Link>
                </Empty>
              )}
            </div>
          ) : (
            <>
              {/* Danh sách đơn/lịch sử có thể lọc tiếp theo trạng thái. */}
              <div className="results-bar">
                <p>{list.length} đơn thuê</p>
                <select
                  aria-label="Lọc trạng thái đơn"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  {[
                    'pending',
                    'paid',
                    'confirmed',
                    'renting',
                    'completed',
                    'cancelled',
                    'expired',
                  ].map((status) => (
                    <option value={status} key={status}>
                      {
                        {
                          pending: 'Chờ thanh toán cọc',
                          paid: 'Chờ xác nhận',
                          confirmed: 'Đã xác nhận',
                          renting: 'Đang thuê',
                          completed: 'Đã hoàn thành',
                          cancelled: 'Đã hủy',
                          expired: 'Đã hết hạn',
                        }[status]
                      }
                    </option>
                  ))}
                </select>
              </div>
              {/* Mỗi đơn tạo một thẻ xe kèm ngày thuê, tổng tiền và trạng thái cọc. */}
              {list.length ? (
                list.map((order) => (
                  <article key={order.id} className="panel order-card">
                    <div className="order-card-top">
                      <span className="muted">{order.id}</span>
                      <Badge status={order.status} />
                    </div>
                    <div className="order-card-body">
                      <img
                        src={data.cars.find((c) => c.id === order.carId)?.image || order.carImage}
                        alt={order.carName}
                      />
                      <div>
                        <h3>{order.carName}</h3>
                        <p>
                          {modeNames[order.mode]} · {shortDate(order.start)} –{' '}
                          {shortDate(order.end)}
                        </p>
                        <p>
                          Tổng tiền: <strong>{money(order.total)}</strong>
                        </p>
                        <small className="muted">
                          {order.depositPaid
                            ? `Đã cọc ${money(order.deposit)}`
                            : 'Chưa thanh toán cọc'}{' '}
                          ·{' '}
                          {order.balancePaid
                            ? 'Đã thanh toán đủ'
                            : `Còn lại ${money(order.remaining)}`}
                        </small>
                      </div>
                    </div>
                    {/* Nút hiện theo trạng thái; backend vẫn kiểm tra quyền mỗi lần thao tác. */}
                    <div className="actions">
                      <Button variant="outline small" onClick={() => setDetail(order)}>
                        Xem chi tiết
                      </Button>
                      {order.status === 'pending' && (
                        <Link to={`/payment/${order.id}`} className="btn small">
                          Thanh toán cọc
                        </Link>
                      )}
                      {['pending', 'paid'].includes(order.status) && (
                        <Button variant="ghost small" onClick={() => setCancel(order)}>
                          Hủy đơn
                        </Button>
                      )}
                      {order.status === 'completed' && !reviewedIds.has(order.id) && (
                        <Button variant="small" onClick={() => setReview(order)}>
                          Đánh giá xe
                        </Button>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <Empty title="Chưa có đơn thuê phù hợp">
                  <Link to="/cars" className="btn">
                    Khám phá xe
                  </Link>
                </Empty>
              )}
            </>
          )}
        </section>
      </div>
      {/* Chọn xem chi tiết sẽ mở hộp với thông tin đầy đủ của đơn. */}
      {detail && (
        <Modal title={`Đơn thuê ${detail.id}`} onClose={() => setDetail(null)}>
          <Badge status={detail.status} />
          <div className="order-facts">
            {[
              ['Xe', detail.carName],
              ['Nhận xe', `${shortDate(detail.start)} · ${detail.location}`],
              ['Trả xe', `${shortDate(detail.end)} · ${detail.dropoff}`],
              ['Người thuê', `${detail.name} · ${detail.phone}`],
              [
                'Tài xế',
                detail.driverId
                  ? driverName
                  : detail.mode === 'driver'
                    ? 'Chờ phân công sau khi cọc'
                    : 'Không áp dụng',
              ],
              ['Tổng chi phí', money(detail.total)],
              [
                'Tiền cọc',
                `${money(detail.deposit)} · ${detail.depositPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}`,
              ],
              [
                'Còn lại',
                `${money(detail.remaining)} · ${detail.balancePaid ? 'Đã thanh toán' : 'Chưa thanh toán'}`,
              ],
              ['Ghi chú', detail.note || 'Không có'],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {/* Khách phải xác nhận trước khi cancelOrder gửi yêu cầu hủy đến backend. */}
      {cancel && (
        <Confirm
          title="Hủy đơn thuê?"
          text={
            cancel.depositPaid
              ? 'Đơn đã cọc sẽ cần liên hệ quản trị viên để xử lý hoàn tiền theo chính sách. Hệ thống không tự hoàn tiền.'
              : 'Sau khi hủy, xe sẽ được giải phóng cho khách hàng khác.'
          }
          onClose={() => setCancel(null)}
          onConfirm={cancelOrder}
        />
      )}
      {/* Form đánh giá gửi qua saveReview; mỗi đơn hoàn thành chỉ được đánh giá một lần. */}
      {review && (
        <Modal title={`Đánh giá ${review.carName}`} onClose={() => setReview(null)}>
          <form onSubmit={saveReview}>
            <Field label="Mức độ hài lòng">
              <select name="stars" defaultValue="5">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option value={n} key={n}>
                    {'★'.repeat(n)} · {n} sao
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Trải nghiệm của bạn">
              <textarea
                name="text"
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                placeholder="Chia sẻ ít nhất 10 ký tự về chuyến đi…"
              />
            </Field>
            <Button className="full">Gửi đánh giá</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
