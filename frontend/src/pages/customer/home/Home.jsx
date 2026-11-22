// Lấy ảnh banner và các thành phần có sẵn để ghép thành trang chủ.
import { heroImage } from '../../../constants/data';
import { Icon, Link } from '../../../components/common/UI';
import CarCard from '../../../components/customer/CarCard';
import SearchForm from '../../../components/customer/SearchForm';
import useHome from './useHome';

// File này dựng giao diện trang chủ. Phần lọc dữ liệu nằm trong useHome.js.

export default function Home() {
  // category: loại xe đang chọn; setCategory: đổi loại xe khi khách bấm nút.
  // available: xe để hiển thị; visibleReviews: đánh giá được phép hiển thị.
  const { category, setCategory, available, visibleReviews } = useHome();

  // return trả về các khối giao diện theo thứ tự xuất hiện trên trang.
  return (
    <>
      {/* Banner dẫn đến danh sách xe, khung tìm kiếm truyền bộ lọc qua URL. */}
      <section className="hero">
        {/* Đặt ảnh nền cho banner đầu trang. */}
        <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="container hero-content">
          <div className="hero-kicker">
            <span /> CHẠM ĐẾN NHỮNG HÀNH TRÌNH MỚI
          </div>
          {/* Tiêu đề lớn và lời giới thiệu trên banner. */}
          <h1>
            Tự do trên
            <br />
            mọi <em>hành trình.</em>
          </h1>
          <p>
            Một chiếc xe phù hợp. Một chuyến đi đáng nhớ.
            <br />
            Cùng ReCars, khám phá theo cách của riêng bạn.
          </p>
          {/* Bấm nút này sẽ mở trang danh sách xe. */}
          <Link to="/cars" className="btn">
            Khám phá xe <Icon name="car" size={20} />
          </Link>
          <div className="hero-footnote">
            <Icon name="shield" size={19} />
            <span>Chi phí rõ ràng · Đặt xe thuận tiện</span>
          </div>
        </div>
        <div className="hero-caption">
          QUY NHƠN & NHỮNG CUNG ĐƯỜNG MỚI
          <br />
          <span>ReCars travel collection · Ảnh minh họa</span>
        </div>
      </section>
      {/* Ghép form tìm xe có sẵn từ components/customer/SearchForm.jsx. */}
      <div className="container search-overlap">
        <SearchForm />
      </div>
      {/* map duyệt 3 mục bên dưới và dựng một ô giới thiệu cho mỗi mục. */}
      <div className="container trust-strip">
        {[
          ['shield', 'An tâm mỗi chuyến đi', 'Thông tin xe & chi phí rõ ràng'],
          ['car', 'Lựa chọn theo nhu cầu', 'Tự lái hoặc có tài xế'],
          ['clock', 'Đặt xe thuận tiện', 'Tìm kiếm và theo dõi trực tuyến'],
        ].map(([icon, title, text]) => (
          <div key={title}>
            <Icon name={icon} size={29} />
            <div>
              <strong>{title}</strong>
              <small>{text}</small>
            </div>
          </div>
        ))}
      </div>
      {/* Các nút loại xe lọc cùng một nguồn dữ liệu để tránh viết lặp thẻ xe. */}
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CHỌN XE, CHỌN TRẢI NGHIỆM</span>
            <h2>Chiếc xe cho chuyến đi của bạn</h2>
            <p>Từ những chuyến dạo phố đến hành trình xa cùng gia đình.</p>
          </div>
          <Link to="/cars" className="text-link">
            Xem tất cả xe <Icon name="chevron" size={17} />
          </Link>
        </div>
        <div className="filter-pills">
          {/* Bấm một loại xe sẽ gọi setCategory; nút đang chọn có lớp selected. */}
          {['Tất cả', 'SUV', 'Sedan', 'Thể thao'].map((type) => (
            <button
              key={type}
              className={category === type ? 'selected' : ''}
              onClick={() => setCategory(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="car-grid">
          {/* Mỗi phần tử trong available tạo một thẻ xe CarCard; key giúp React nhận diện xe. */}
          {available.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
        <small className="demo-note">
          Bộ sưu tập xe và giá thuê là dữ liệu minh họa cho đồ án.
        </small>
      </section>
      {/* Khối giới thiệu ReCars: ảnh minh họa bên trái, nội dung và lợi ích bên phải. */}
      <section className="experience">
        <div className="container experience-grid">
          <div className="experience-photo">
            <img
              src="https://images.unsplash.com/photo-1666739339626-0b4cdec04a24?auto=format&fit=crop&w=900&q=85"
              alt="Hành trình qua những cung đường núi"
              loading="lazy"
            />
            <span>
              Đi xa hơn.
              <br />
              <em>Trải nghiệm nhiều hơn.</em>
            </span>
          </div>
          <div>
            <span className="eyebrow">KHÔNG CHỈ LÀ THUÊ XE</span>
            <h2>
              Thảnh thơi tận hưởng.
              <br />
              Để hành trình lên tiếng.
            </h2>
            <p>
              Mỗi kế hoạch đều có một chiếc xe phù hợp. ReCars giúp bạn tìm lựa chọn cho chuyến đi,
              với thông tin rõ ràng ngay từ đầu.
            </p>
            {/* Mỗi bộ icon, title, text bên dưới tạo một hàng lợi ích. */}
            {[
              [
                'shield',
                'Minh bạch trong từng chi phí',
                'Xem trước tổng tiền, tiền cọc và số tiền còn lại.',
              ],
              [
                'user',
                'Linh hoạt cách bạn di chuyển',
                'Tự cầm lái hoặc chọn chuyến đi cùng tài xế.',
              ],
              [
                'wallet',
                'Theo dõi đơn thuê dễ dàng',
                'Thông tin đặt xe và trạng thái được lưu cùng nhau.',
              ],
            ].map(([icon, title, text]) => (
              <div className="benefit" key={title}>
                <span>
                  <Icon name={icon} size={23} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
            <Link to="/about" className="text-link">
              Tìm hiểu về ReCars <Icon name="chevron" size={17} />
            </Link>
          </div>
        </div>
      </section>
      {/* Khối hướng dẫn khách thực hiện 3 bước: tìm xe, đặt/cọc, nhận xe. */}
      <section className="container section">
        <div className="section-heading centered">
          <span className="eyebrow">ĐƠN GIẢN TỪ BƯỚC ĐẦU TIÊN</span>
          <h2>Sẵn sàng lăn bánh, chỉ vài bước</h2>
          <p>Chọn xe yêu thích và bắt đầu lên kế hoạch cho chuyến đi.</p>
        </div>
        <div className="steps-grid">
          {[
            [
              'search',
              'Tìm chiếc xe phù hợp',
              'Chọn địa điểm, thời gian và hình thức thuê theo nhu cầu.',
            ],
            [
              'calendar',
              'Đặt xe & thanh toán cọc',
              'Kiểm tra thông tin và thanh toán tiền cọc để giữ xe.',
            ],
            ['car', 'Nhận xe & khởi hành', 'Theo dõi xác nhận, nhận xe và tận hưởng hành trình.'],
          ].map(([icon, title, text]) => (
            <div key={title}>
              <span className="step-icon">
                <Icon name={icon} size={29} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Khối đánh giá: dữ liệu đã được lọc trong useHome.js. */}
      <section className="reviews-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">NHỮNG CÂU CHUYỆN TRÊN ĐƯỜNG</span>
              <h2>Hành trình qua lời kể</h2>
              <p>Trải nghiệm được chia sẻ từ những chuyến đi đã hoàn thành.</p>
            </div>
            <Icon name="star" size={36} />
          </div>
          <div className="review-grid">
            {/* Chưa có đánh giá thì hiện lời nhắn này; && nghĩa là chỉ hiện khi điều kiện đúng. */}
            {!visibleReviews.length && (
              <div className="review-card">
                <h3>Chờ những câu chuyện đầu tiên</h3>
                <p>Đánh giá sẽ xuất hiện sau các chuyến đi hoàn thành.</p>
              </div>
            )}
            {/* Mỗi đánh giá tạo một thẻ gồm số sao, nội dung và tên người viết. */}
            {visibleReviews.map((r) => (
              <article className="review-card" key={r.id}>
                <div className="stars">
                  {'★'.repeat(r.stars)}
                  {'☆'.repeat(5 - r.stars)}
                </div>
                <p>“{r.text}”</p>
                <div className="review-author">
                  <span className="avatar">{r.name.charAt(0)}</span>
                  <div>
                    <strong>{r.name}</strong>
                    <small>
                      {r.userId === 'sample' ? 'Nội dung minh họa' : 'Đã hoàn thành chuyến đi'}
                    </small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      {/* Lời mời tìm xe ở cuối trang, dẫn khách đến /cars. */}
      <section className="container">
        <div className="cta-banner">
          <div>
            <span className="eyebrow">CHUYẾN ĐI TIẾP THEO ĐANG CHỜ BẠN</span>
            <h2>Lên kế hoạch. Chọn xe. Khởi hành.</h2>
            <p>Những kỷ niệm đẹp bắt đầu từ một quyết định nhỏ.</p>
          </div>
          <Link to="/cars" className="btn light">
            Tìm xe cho chuyến đi <Icon name="car" />
          </Link>
        </div>
      </section>
    </>
  );
}
