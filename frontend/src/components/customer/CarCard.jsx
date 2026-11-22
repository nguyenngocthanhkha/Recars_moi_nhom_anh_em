import { Icon, Link } from '../common/UI';
import { money } from '../../utils/booking';
import useCarCard from './useCarCard';

// Một thẻ xe được tái sử dụng ở trang chủ, danh sách và xe liên quan.

export default function CarCard({ car, query = '' }) {
  // Nhận dữ liệu và hàm xử lý từ hook, bên dưới chỉ dựng giao diện.
  const { liked, setLiked, suffix } = useCarCard({ car, query });

  return (
    <article className="car-card">
      {/* Ảnh và tên xe dẫn đến trang chi tiết, giữ lại bộ lọc ngày thuê trong suffix. */}
      <div className="car-photo">
        <Link to={`/cars/${car.id}${suffix}`}>
          <img src={car.image} alt={`${car.name} – ảnh minh họa`} loading="lazy" />
        </Link>
        <span className="photo-label">{car.type}</span>
        {/* Trái tim chỉ đổi trạng thái yêu thích trên lần xem hiện tại. */}
        <button
          className={`like ${liked ? 'liked' : ''}`}
          aria-label={liked ? 'Bỏ yêu thích' : 'Yêu thích xe'}
          aria-pressed={liked}
          onClick={() => setLiked(!liked)}
        >
          <Icon name="heart" size={19} />
        </button>
      </div>
      <div className="car-info">
        <div className="car-location">
          <span>
            <Icon name="pin" size={14} />
            {car.location}
          </span>
          <span>Ảnh minh họa</span>
        </div>
        <Link to={`/cars/${car.id}${suffix}`}>
          <h3>{car.name}</h3>
        </Link>
        {/* Ba thông số ngắn: số chỗ, hộp số và nhiên liệu. */}
        <div className="car-specs">
          <span>
            <Icon name="user" size={16} />
            {car.seats} chỗ
          </span>
          <span>
            <Icon name="gear" size={16} />
            {car.gear}
          </span>
          <span>
            <Icon name="fuel" size={16} />
            {car.fuel}
          </span>
        </div>
        {/* Định dạng giá thuê theo VND và hiển thị đơn vị mỗi ngày. */}
        <div className="car-bottom">
          <div>
            <strong>{money(car.price)}</strong>
            <small> / ngày</small>
          </div>
          <Link
            to={`/cars/${car.id}${suffix}`}
            className="round-link"
            aria-label={`Xem chi tiết ${car.name}`}
          >
            <Icon name="chevron" size={20} />
          </Link>
        </div>
        {/* Giữ ngày thuê và hình thức đã chọn khi chuyển sang bước đặt xe. */}
        <div className="car-actions">
          <Link to={`/cars/${car.id}${suffix}`} className="btn outline small">
            Xem chi tiết
          </Link>
          <Link to={`/booking/${car.id}${suffix}`} className="btn small">
            Đặt xe
          </Link>
        </div>
      </div>
    </article>
  );
}
