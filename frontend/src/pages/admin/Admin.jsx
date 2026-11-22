import useAdminAccess from './useAdminAccess';
import { Button, Icon, Link } from '../../components/common/UI';
import { Logo } from '../../layouts/CustomerLayout';
import { adminSections as sections } from '../../constants/admin';
import Dashboard from './Dashboard';
import AdminBookings from './AdminBookings';
import EntityManager from './EntityManager';
import Payments from './Payments';

// Gate giao diện dựa vào phiên thật; backend kiểm tra quyền ở mọi API quản trị.
export default function Admin({ section = 'dashboard' }) {
  // Hook cho biết tài khoản có quyền Admin và cung cấp hàm đăng nhập/đăng xuất.
  const { entered, enter, user, logout } = useAdminAccess();
  // Chưa có quyền Admin thì hiện lời mời đăng nhập, không dựng nội dung quản trị.
  if (!entered)
    return (
      <div className="admin-entry">
        <Logo />
        <div className="panel">
          <span className="eyebrow">KHÔNG GIAN QUẢN TRỊ</span>
          <h1>ReCars Admin</h1>
          <p>Quản lý xe, đơn thuê, thanh toán và đội ngũ tài xế.</p>
          <div className="notice">
            {user
              ? 'Tài khoản hiện tại không có quyền quản trị. Vui lòng đăng nhập bằng tài khoản Admin.'
              : 'Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục.'}
          </div>
          <Button className="full" onClick={enter}>
            Đăng nhập quản trị
          </Button>
          <Link to="/" className="text-link">
            Về trang khách hàng
          </Link>
        </div>
      </div>
    );
  return (
    <div className="admin-shell">
      {/* Menu quản trị bên trái, các mục được lấy từ constants/admin.js. */}
      <aside className="admin-sidebar">
        <Logo />
        <span className="sidebar-label">KHÔNG GIAN QUẢN TRỊ</span>
        <nav aria-label="Điều hướng quản trị">
          {sections.map(([key, icon, title]) => (
            <Link key={key} to={`/admin/${key}`} className={key === section ? 'active' : ''}>
              <Icon name={icon} />
              {title}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link to="/">
            <Icon name="car" />
            Xem website
          </Link>
          <button className="btn ghost small" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <div className="admin-main">
        {/* Thanh trên cùng hiển thị mục đang mở và tài khoản Admin hiện tại. */}
        <header className="admin-header">
          <div>
            <span className="muted">Không gian làm việc / </span>
            <strong>{sections.find(([key]) => key === section)?.[2]}</strong>
          </div>
          <div className="admin-person">
            <span className="badge confirmed">Quản trị hệ thống</span>
            <span className="avatar">{user.name.charAt(0)}</span>
            <div>
              <strong>{user.name}</strong>
              <small>Nhóm anh em</small>
            </div>
          </div>
        </header>
        {/* Chọn màn hình theo section; các danh mục còn lại dùng EntityManager chung. */}
        <main className="admin-content">
          {section === 'dashboard' ? (
            <Dashboard />
          ) : section === 'bookings' ? (
            <AdminBookings />
          ) : section === 'payments' ? (
            <Payments />
          ) : (
            <EntityManager key={section} section={section} />
          )}
        </main>
      </div>
    </div>
  );
}
