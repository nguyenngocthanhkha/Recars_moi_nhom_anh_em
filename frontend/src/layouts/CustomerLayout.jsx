import { Icon, Link } from '../components/common/UI';
import useCustomerLayout from './useCustomerLayout';

// Logo dạng vector hiển thị rõ ở cả màn hình nhỏ và màn hình lớn.
// Logo dùng chung, bấm vào sẽ về trang chủ.
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="NHÓM ANH EM – ReCars, trang chủ">
      <span className="logo-mark">
        <Icon name="car" size={32} />
      </span>
      <span>
        <strong>NHÓM ANH EM</strong>
        <small>ReCars · Car Rental Service</small>
      </span>
    </Link>
  );
}

// Header và footer dùng chung cho toàn bộ trang khách hàng.

export default function CustomerLayout({ children, path }) {
  // Nhận dữ liệu và hàm xử lý từ hook, bên dưới chỉ dựng giao diện.
  const { data, open, setOpen, links, logout } = useCustomerLayout({ children, path });

  return (
    <>
      {/* Dòng giới thiệu ngắn và địa điểm phía trên cùng website. */}
      <div className="topbar">
        Mỗi chuyến đi, một trải nghiệm mới.
        <span>
          <Icon name="pin" size={14} /> Quy Nhơn, Việt Nam
        </span>
      </div>
      {/* Header chứa logo, menu và tài khoản; open điều khiển menu điện thoại. */}
      <header className="header">
        <div className="container header-inner">
          <Logo />
          <button
            className="menu-toggle"
            aria-label="Mở menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Icon name="menu" />
          </button>
          <nav
            className={open ? 'nav open' : 'nav'}
            aria-label="Điều hướng chính"
            onClick={() => setOpen(false)}
          >
            {links.map(([to, title]) => (
              <Link key={to} to={to} className={path === to ? 'active' : ''}>
                {title}
              </Link>
            ))}
          </nav>
          {/* Đã đăng nhập thì hiện tài khoản; chưa đăng nhập thì hiện nút đăng nhập/đăng ký. */}
          <div className="header-actions">
            {data.user ? (
              <details className="account-menu">
                <summary className="account-link">
                  <span className="avatar">{data.user.name.charAt(0)}</span>
                  <span>Tài khoản</span>
                </summary>
                <div>
                  <Link to="/account">Thông tin cá nhân</Link>
                  <Link to="/account/bookings">Đơn thuê của tôi</Link>
                  {data.user.role === 'admin' && <Link to="/admin">Quản trị hệ thống</Link>}
                  <button onClick={logout}>Đăng xuất</button>
                </div>
              </details>
            ) : (
              <>
                <Link to="/login" className="login-link">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn small">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {/* children là nội dung trang mà AppRoutes đã chọn, như Home hoặc Booking. */}
      <main>{children}</main>
      {/* Footer dùng chung cho các trang khách hàng. */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Logo />
            <p>
              Đồng hành cùng bạn trên mọi cung đường.
              <br />
              Tự do khám phá, an tâm trải nghiệm.
            </p>
            <span className="eyebrow">YOUR JOURNEY, YOUR WAY.</span>
          </div>
          <div>
            <h4>Khám phá</h4>
            <Link to="/cars">Thuê xe tự lái</Link>
            <Link to="/cars?mode=driver">Thuê xe có tài xế</Link>
            <Link to="/about">Về ReCars</Link>
          </div>
          <div>
            <h4>Hỗ trợ khách hàng</h4>
            <Link to="/guide">Hướng dẫn thuê xe</Link>
            <Link to="/policy">Chính sách thuê xe</Link>
            <Link to="/contact">Liên hệ hỗ trợ</Link>
          </div>
          <div>
            <h4>Nhóm anh em</h4>
            <p>
              Khoa Công nghệ thông tin
              <br />
              Trường Đại học Quy Nhơn
            </p>
            <Link to="/contact">Thông tin liên hệ của nhóm</Link>
            <Link to="/admin">Quản trị hệ thống</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} ReCars · NHÓM ANH EM</span>
          <span>Đồ án giao diện · Dữ liệu & hình ảnh minh họa</span>
          <Link to="/design-system">Design System</Link>
        </div>
      </footer>
    </>
  );
}
