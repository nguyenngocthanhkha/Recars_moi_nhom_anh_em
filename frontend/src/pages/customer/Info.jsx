import useContact from './useContact';
import { Button, Field, Icon, Link, PageTitle } from '../../components/common/UI';
import { Logo } from '../../layouts/CustomerLayout';

// Trang thông tin dùng nội dung chung, tách khỏi xử lý đặt xe.
export default function Info({ type }) {
  const { submitContact, busy, contactEmail, configured } = useContact();
  // /contact có form riêng; dữ liệu và hàm gửi email được lấy từ useContact.js.
  if (type === 'contact')
    return (
      <div className="container page">
        <PageTitle
          eyebrow="CHÚNG TÔI LUÔN LẮNG NGHE"
          title="Kết nối với ReCars"
          text="Gửi câu hỏi hoặc chia sẻ kế hoạch cho chuyến đi của bạn."
        />
        <div className="detail-layout">
          {/* name trên từng ô giúp hook đọc họ tên, email và nội dung bằng FormData. */}
          <form className="panel" onSubmit={submitContact}>
            <h2>Bạn cần hỗ trợ điều gì?</h2>
            <div className="form-grid">
              <Field label="Họ và tên" name="name" required maxLength={80} />
              <Field label="Email" name="email" type="email" required />
            </div>
            <Field label="Nội dung">
              <textarea
                name="message"
                rows={6}
                required
                minLength={10}
                maxLength={1000}
                placeholder="Chia sẻ cùng chúng tôi…"
              />
            </Field>
            {/* Thiếu cấu hình gửi email thì hiện thông báo và khóa nút gửi. */}
            {!configured && (
              <p className="notice small-text">
                Hộp thư liên hệ chưa được cấu hình. Vui lòng quay lại sau.
              </p>
            )}
            <Button disabled={busy || !configured}>{busy ? 'Đang gửi…' : 'Gửi lời nhắn'}</Button>
          </form>
          <aside className="panel">
            <Icon name="pin" size={32} />
            <h2>Nhóm anh em</h2>
            <p>
              Khoa Công nghệ thông tin
              <br />
              Trường Đại học Quy Nhơn
            </p>
            <hr />
            <h3>Email của nhóm</h3>
            <p className="muted">{contactEmail || 'Địa chỉ liên hệ sẽ được nhóm cập nhật.'}</p>
            <Link to="/guide" className="text-link">
              Xem hướng dẫn thuê xe
            </Link>
          </aside>
        </div>
      </div>
    );
  // Trang giới thiệu bộ màu, kiểu chữ và các thành phần giao diện dùng chung.
  if (type === 'design-system')
    return (
      <div className="container page">
        <PageTitle
          eyebrow="NHÓM ANH EM · RECARS"
          title="Design System"
          text="Các quy chuẩn dùng chung cho Customer và Admin."
        />
        <section className="panel">
          <h2>Nhận diện thương hiệu</h2>
          <Logo />
          <h2>Bảng màu</h2>
          <div className="swatches">
            {[
              ['Warm Ivory', '#F5F1E9'],
              ['Soft White', '#FFFEFB'],
              ['Sand Beige', '#D8CBB9'],
              ['Warm Taupe', '#A99A87'],
              ['Burnt Orange', '#B66D45'],
              ['Deep Graphite', '#343330'],
              ['Soft Charcoal', '#625E57'],
              ['Light Border', '#E6DFD5'],
              ['Success Green', '#4C805F'],
              ['Error Red', '#C94C45'],
            ].map(([name, hex]) => (
              <div key={name}>
                <span style={{ background: hex }} />
                <strong>{name}</strong>
                <small>{hex}</small>
              </div>
            ))}
          </div>
          <h2>Typography · Be Vietnam Pro</h2>
          <h1>Hành trình của riêng bạn</h1>
          <h2>Chiếc xe cho chuyến đi tiếp theo</h2>
          <p>Nội dung dùng font dễ đọc, các cỡ chữ được điều chỉnh theo màn hình.</p>
          <h2>Thành phần dùng chung</h2>
          <div className="actions">
            <Button>Nút chính</Button>
            <Button variant="outline">Nút phụ</Button>
            <Button disabled>Chưa khả dụng</Button>
            <span className="badge confirmed">Đã xác nhận</span>
            <span className="badge cancelled">Đã hủy</span>
          </div>
          <div className="form-grid">
            <Field label="Ô nhập thông tin" placeholder="Ví dụ nội dung…" />
            <Field label="Lựa chọn">
              <select>
                <option>Tự lái</option>
                <option>Có tài xế</option>
              </select>
            </Field>
          </div>
          <h2>Bộ icon</h2>
          <div className="actions">
            {['car', 'pin', 'calendar', 'user', 'shield', 'wallet', 'star', 'search'].map(
              (name) => (
                <Icon key={name} name={name} size={26} />
              ),
            )}
          </div>
        </section>
      </div>
    );
  // Nội dung tĩnh theo từng trang; [type] lấy đúng mục about, guide hoặc policy.
  const content = {
    about: {
      eyebrow: 'NHÓM ANH EM · RECARS',
      title: 'Đi theo cách của bạn.',
      text: 'Một nền tảng giúp việc tìm kiếm và đặt thuê xe trở nên rõ ràng, thuận tiện hơn.',
      blocks: [
        [
          'Về ReCars',
          'ReCars là đồ án nền tảng cho thuê xe trực tuyến của Nhóm anh em, Khoa Công nghệ thông tin, Trường Đại học Quy Nhơn. Website hướng đến hai lựa chọn: thuê xe tự lái và thuê xe có tài xế.',
        ],
        [
          'Một trải nghiệm thống nhất',
          'Từ tìm xe, xem thông tin, đặt chuyến đi đến theo dõi thanh toán và đánh giá, mọi bước được sắp xếp trong cùng một trải nghiệm.',
        ],
        [
          'Minh bạch từ đầu',
          'Chi phí thuê xe, phí tài xế, tiền cọc và số tiền còn lại được hiển thị riêng để khách hàng kiểm tra trước khi xác nhận.',
        ],
      ],
    },
    guide: {
      eyebrow: 'BẮT ĐẦU HÀNH TRÌNH',
      title: 'Hướng dẫn thuê xe',
      text: 'Các bước để tìm và đặt chiếc xe phù hợp.',
      blocks: [
        [
          'Tìm và chọn xe',
          'Chọn địa điểm, ngày nhận/trả và hình thức thuê. Dùng bộ lọc hãng xe, số chỗ và giá để thu hẹp lựa chọn.',
        ],
        [
          'Kiểm tra và đặt xe',
          'Đọc thông tin xe, nhập địa điểm nhận/trả, thông tin liên hệ và kiểm tra bảng chi phí. Đăng nhập trước khi xác nhận đơn.',
        ],
        [
          'Thanh toán tiền cọc',
          'Tự lái cọc 30% tiền xe. Có tài xế cọc 20% tổng chi phí. Bạn có tối đa 3 ngày để thanh toán tiền cọc trước khi đơn hết hạn.',
        ],
        [
          'Nhận xe và hoàn thành',
          'Theo dõi đơn trong tài khoản. Với xe có tài xế, admin phân công sau khi cọc thành công. Sau khi hoàn thành, bạn có thể đánh giá một lần cho mỗi đơn.',
        ],
      ],
    },
    policy: {
      eyebrow: 'THÔNG TIN CẦN BIẾT',
      title: 'Chính sách thuê xe',
      text: 'Quy định nghiệp vụ trong phạm vi đồ án ReCars.',
      blocks: [
        [
          'Tiền cọc',
          'Thuê tự lái: cọc 30%, thanh toán 70% còn lại. Thuê có tài xế: cọc 20% tổng tiền xe và phí tài xế, còn lại 80%.',
        ],
        [
          'Thời hạn giữ xe',
          'Sau khi tạo đơn, xe được giữ tối đa 3 ngày chờ thanh toán cọc. Đơn chưa cọc sẽ tự hết hạn và xe được giải phóng.',
        ],
        [
          'Tài xế',
          'Khách hàng không tự chọn tài xế. Admin chỉ phân công tài xế sau khi tiền cọc được thanh toán thành công.',
        ],
        [
          'Hủy đơn và hoàn tiền',
          'Đơn chờ thanh toán hoặc chờ xác nhận có thể hủy trong tài khoản. Với đơn đã cọc, cần liên hệ nhóm để xử lý hoàn tiền và đối soát giao dịch. Hệ thống không tự hoàn tiền khi hủy đơn.',
        ],
        [
          'Đánh giá',
          'Chỉ người có đơn thuê đã hoàn thành mới được gửi đánh giá. Mỗi đơn được đánh giá một lần.',
        ],
        [
          'Môi trường thanh toán',
          'Website sử dụng VNPAY Sandbox cho giao dịch thử nghiệm. Khi cổng thanh toán chưa được cấu hình, hệ thống sẽ thông báo và không cho tạo giao dịch.',
        ],
      ],
    },
  }[type];
  // Địa chỉ không thuộc các trang đã định nghĩa thì hiện trang không tồn tại.
  if (!content)
    return (
      <div className="container page">
        <PageTitle title="Trang không tồn tại" />
        <Link to="/" className="btn">
          Về trang chủ
        </Link>
      </div>
    );
  return (
    <div className="container page info-page">
      <PageTitle eyebrow={content.eyebrow} title={content.title} text={content.text} />
      <div className="panel">
        {/* Mỗi cặp tiêu đề/nội dung tạo một khối thông tin trên trang. */}
        {content.blocks.map(([title, text]) => (
          <section className="info-block" key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
        <Link to="/cars" className="btn">
          Khám phá xe
        </Link>
      </div>
    </div>
  );
}
