import { Button, Empty, Field, Link, PageTitle } from '../../../components/common/UI';
import CostSummary from '../../../components/customer/CostSummary';
import { today, dateAfter } from '../../../utils/booking';
import useBooking from './useBooking';

// Đơn được tạo sau khi kiểm tra lại ngày thuê và xung đột giữ xe.

export default function Booking({ id, params }) {
  // Nhận dữ liệu và hàm xử lý từ hook, bên dưới chỉ dựng giao diện.
  const { data, car, start, setStart, end, setEnd, mode, setMode, error, busy, cost, submit } =
    useBooking({ id, params });
  // Xe bị ẩn hoặc không tồn tại thì hướng khách về trang chọn xe.
  if (!car)
    return (
      <Empty title="Xe không còn khả dụng">
        <Link to="/cars" className="btn">
          Chọn xe khác
        </Link>
      </Empty>
    );
  // Chưa đăng nhập thì hiện nút đăng nhập, giữ lại đường dẫn đặt xe để quay về.
  if (!data.user)
    return (
      <div className="container page">
        <Empty
          title="Đăng nhập để tiếp tục đặt xe"
          text="Đăng nhập hoặc tạo tài khoản để lưu và theo dõi đơn thuê."
        >
          <Link
            to={`/login?next=${encodeURIComponent(`/booking/${id}?${params}`)}`}
            className="btn"
          >
            Đăng nhập
          </Link>
        </Empty>
      </div>
    );

  return (
    <div className="container page">
      {/* Hiển thị vị trí hiện tại trong quy trình đặt xe. */}
      <div className="progress-steps">
        <span className="active">Chọn xe</span>
        <span className="active">Thông tin đặt xe</span>
        <span>Thanh toán cọc</span>
      </div>
      <PageTitle
        eyebrow="HÀNH TRÌNH CỦA BẠN"
        title="Hoàn tất thông tin đặt xe"
        text="Kiểm tra lịch trình và chi phí trước khi xác nhận."
      />
      {/* Gửi form sẽ gọi submit trong useBooking.js; JSX chỉ dựng các ô nhập. */}
      <form onSubmit={submit} className="detail-layout">
        <div className="panel">
          <h2>Thông tin chuyến đi</h2>
          {/* Ngày nhận/trả liên kết với start/end; đổi ô nhập sẽ cập nhật dự tính chi phí. */}
          <div className="form-grid">
            <Field
              label="Ngày nhận xe"
              type="date"
              min={today()}
              value={start}
              required
              onChange={(e) => setStart(e.target.value)}
            />
            <Field
              label="Ngày trả xe"
              type="date"
              min={dateAfter(start, 1)}
              value={end}
              required
              onChange={(e) => setEnd(e.target.value)}
            />
            <Field
              label="Địa điểm nhận xe"
              name="location"
              defaultValue="Quy Nhơn"
              required
              maxLength={150}
            />
            <Field
              label="Địa điểm trả xe"
              name="dropoff"
              defaultValue="Quy Nhơn"
              required
              maxLength={150}
            />
            <Field label="Hình thức thuê">
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                {car.modes.map((m) => (
                  <option value={m} key={m}>
                    {m === 'self' ? 'Tự lái' : 'Có tài xế'}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {/* Hình thức có tài xế cần thông báo phí và quy tắc Admin phân công sau cọc. */}
          {mode === 'driver' && (
            <div className="notice">
              Phí tài xế mẫu: 500.000đ/ngày. Admin phân công tài xế sau khi thanh toán cọc thành
              công; khách hàng không tự chọn tài xế.
            </div>
          )}
          {/* Điền sẵn thông tin tài khoản; khách có thể sửa liên hệ riêng cho đơn này. */}
          <h2>Thông tin người thuê</h2>
          <div className="form-grid">
            <Field
              label="Họ và tên"
              name="name"
              defaultValue={data.user.name}
              required
              maxLength={80}
            />
            <Field
              label="Số điện thoại"
              name="phone"
              defaultValue={data.user.phone}
              type="tel"
              pattern="0[0-9]{9}"
              title="Số điện thoại gồm 10 chữ số, bắt đầu bằng 0"
              required
            />
          </div>
          <Field label="Ghi chú">
            <textarea
              name="note"
              placeholder="Thời gian nhận xe, yêu cầu hỗ trợ…"
              rows={3}
              maxLength={500}
            />
          </Field>
          {/* required buộc khách đồng ý chính sách trước khi gửi form. */}
          <label className="checkbox">
            <input type="checkbox" required />
            Tôi đã đọc và đồng ý với{' '}
            <Link to="/policy" className="text-link">
              chính sách thuê xe
            </Link>
            .
          </label>
          {/* Chỉ hiện đoạn này khi hook trả về thông báo lỗi. */}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </div>
        {/* Cột tóm tắt xe, chi phí dự tính và nút xác nhận đặt xe. */}
        <aside className="panel booking-aside">
          <img className="summary-photo" src={car.image} alt={car.name} />
          <h2>{car.name}</h2>
          <p className="muted">
            {car.seats} chỗ · {car.gear}
          </p>
          <CostSummary cost={cost} />
          <Button className="full" disabled={cost.days <= 0 || busy}>
            {busy ? 'Đang tạo đơn…' : 'Xác nhận đặt xe'}
          </Button>
          <p className="small-text muted">
            Bạn có 3 ngày để thanh toán tiền cọc. Đơn chưa cọc sẽ tự hết hạn.
          </p>
        </aside>
      </form>
    </div>
  );
}
