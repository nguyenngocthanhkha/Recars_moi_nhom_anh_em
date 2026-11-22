import { Button, Empty, Field, Icon, Link, PageTitle, Modal } from '../../../components/common/UI';
import { today, dateAfter, money } from '../../../utils/booking';
import useCarDetail from './useCarDetail';

// Chi tiết xe dùng cùng hàm tính giá với trang đặt xe.

export default function CarDetail({ id, params }) {
  // Nhận dữ liệu và hàm xử lý từ hook, bên dưới chỉ dựng giao diện.
  const {
    car,
    start,
    changeStart,
    end,
    setEnd,
    mode,
    setMode,
    cost,
    available,
    reviews,
    submit,
    gallery,
    selectedImage,
    setSelectedImage,
    zoom,
    setZoom,
  } = useCarDetail({ id, params });
  // Không có xe hoạt động đúng mã trên URL thì hiện liên kết quay lại danh sách.
  if (!car)
    return (
      <Empty title="Không tìm thấy xe">
        <Link className="btn" to="/cars">
          Xem danh sách xe
        </Link>
      </Empty>
    );

  return (
    <div className="container page">
      {/* Đường dẫn giúp khách quay lại trang chủ hoặc danh sách xe. */}
      <div className="breadcrumbs">
        <Link to="/">Trang chủ</Link> / <Link to="/cars">Danh sách xe</Link> / {car.name}
      </div>
      <PageTitle
        eyebrow={`${car.type} · ${car.brand}`}
        title={car.name}
        text={`${car.location} · ${car.seats} chỗ · ${car.gear}`}
      />
      {/* Ảnh lớn đang chọn; bấm ảnh để mở hộp phóng to. */}
      <div className="detail-hero">
        <button className="gallery-main" onClick={() => setZoom(true)} aria-label="Phóng to ảnh xe">
          <img src={selectedImage} alt={`${car.name} – ảnh minh họa`} />
        </button>
        <span>Ảnh minh họa · Thông số dùng cho đồ án</span>
      </div>
      {/* Chỉ hiện dãy ảnh nhỏ khi xe có nhiều hơn một ảnh. */}
      {gallery.length > 1 && (
        <div className="gallery-thumbnails">
          {gallery.map((src, i) => (
            <button
              key={src}
              className={selectedImage === src ? 'selected' : ''}
              onClick={() => setSelectedImage(src)}
              aria-label={`Xem ảnh ${i + 1}`}
            >
              <img src={src} alt={`${car.name} – ảnh ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
      {/* Hộp ảnh chỉ xuất hiện khi zoom=true; đóng hộp đặt lại zoom=false. */}
      {zoom && (
        <Modal title={car.name} onClose={() => setZoom(false)}>
          <img src={selectedImage} alt={car.name} />
        </Modal>
      )}
      <div className="detail-layout">
        <section>
          {/* Duyệt thông số xe để tạo 4 ô: số chỗ, hộp số, nhiên liệu và dòng xe. */}
          <div className="spec-grid">
            {[
              ['user', `${car.seats} chỗ`, 'Số chỗ ngồi'],
              ['gear', car.gear, 'Hộp số'],
              ['fuel', car.fuel, 'Nhiên liệu'],
              ['car', car.type, 'Dòng xe'],
            ].map(([icon, value, label]) => (
              <div key={label}>
                <Icon name={icon} size={26} />
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="detail-section">
            <h2>Không gian cho mọi trải nghiệm</h2>
            <p>
              {car.name} là lựa chọn để bạn khám phá thành phố hoặc lên kế hoạch cho chuyến đi cùng
              người thân. Chọn hình thức tự lái để chủ động lịch trình, hoặc thuê kèm tài xế để thư
              thả tận hưởng.
            </p>
            {/* Danh sách tiện nghi minh họa cho đồ án. */}
            <h3>Tiện nghi trên xe</h3>
            <div className="amenities">
              {[
                'Điều hòa',
                'Kết nối Bluetooth',
                'Camera lùi',
                'Màn hình giải trí',
                'Cổng sạc USB',
                'Túi khí an toàn',
              ].map((text) => (
                <span key={text}>
                  <Icon name="check" size={17} />
                  {text}
                </span>
              ))}
            </div>
            <p className="demo-note">
              Tiện nghi là dữ liệu mẫu, cần xác minh theo từng xe thực tế.
            </p>
          </div>
          <div className="detail-section">
            <h2>Điều kiện thuê xe</h2>
            <p>
              Thuê tự lái cần giấy tờ tùy thân và giấy phép lái xe hợp lệ. Tiền cọc tự lái là 30%;
              có tài xế là 20% tổng chi phí. Đơn được giữ tối đa 3 ngày chờ thanh toán cọc.
            </p>
            <Link to="/policy" className="text-link">
              Xem chính sách thuê xe
            </Link>
          </div>
          <div className="detail-section">
            {/* Có đánh giá thì dựng từng thẻ; chưa có thì hiện khối Empty. */}
            <h2>Đánh giá từ khách hàng</h2>
            {reviews.length ? (
              reviews.map((r) => (
                <article className="review-card" key={r.id}>
                  <div className="stars">{'★'.repeat(r.stars)}</div>
                  <p>{r.text}</p>
                  <strong>{r.name}</strong>
                  {r.userId === 'sample' && <small className="muted"> · Đánh giá minh họa</small>}
                </article>
              ))
            ) : (
              <Empty
                title="Chưa có đánh giá"
                text="Đánh giá sẽ xuất hiện sau những chuyến đi hoàn thành."
              />
            )}
          </div>
        </section>
        {/* Cột đặt xe: đổi ngày/hình thức sẽ cập nhật chi phí dự tính từ hook. */}
        <aside className="panel booking-aside">
          <div className="price-large">
            {money(car.price)}
            <small>/ ngày</small>
          </div>
          <p className="muted">Lên kế hoạch cho chuyến đi của bạn</p>
          {/* Gửi form chỉ chuyển sang bước đặt xe, chưa tạo giao dịch thanh toán. */}
          <form onSubmit={submit}>
            <Field
              label="Ngày nhận xe"
              type="date"
              min={today()}
              value={start}
              required
              onChange={changeStart}
            />
            <Field
              label="Ngày trả xe"
              type="date"
              min={dateAfter(start, 1)}
              value={end}
              required
              onChange={(e) => setEnd(e.target.value)}
            />
            <Field label="Hình thức thuê">
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                {car.modes.map((value) => (
                  <option value={value} key={value}>
                    {value === 'self' ? 'Tự lái' : 'Có tài xế'}
                  </option>
                ))}
              </select>
            </Field>
            <div className="summary-row">
              <span>Tổng {cost.days} ngày</span>
              <strong>{money(cost.total)}</strong>
            </div>
            {/* Ngày sai hoặc lịch xe bị giữ thì báo lỗi và khóa nút đặt. */}
            {!available && (
              <p className="error">Ngày thuê chưa hợp lệ hoặc xe đã được giữ trong khoảng này.</p>
            )}
            <Button className="full" disabled={!available}>
              Đặt xe ngay
            </Button>
            <small className="muted">Chưa cần thanh toán ở bước này.</small>
          </form>
        </aside>
      </div>
    </div>
  );
}
