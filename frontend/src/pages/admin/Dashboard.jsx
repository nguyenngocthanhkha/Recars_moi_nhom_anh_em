import { Badge, Icon, Link, PageTitle } from '../../components/common/UI';
import { money } from '../../utils/booking';
import useDashboard from './useDashboard';

// Dashboard tính trực tiếp từ dữ liệu; không dùng các số doanh thu giả cố định.

export default function Dashboard() {
  // Nhận dữ liệu và hàm xử lý từ hook, bên dưới chỉ dựng giao diện.
  const { stats, monthly, maximum, tasks, recentOrders } = useDashboard();

  return (
    <>
      <PageTitle
        eyebrow="RECARS OVERVIEW"
        title="Xin chào, Admin"
        text="Một góc nhìn rõ ràng về hoạt động của ReCars."
      />
      {/* Mỗi dòng stats từ hook tạo một ô chỉ số: biểu tượng, tên và giá trị. */}
      <div className="stats-grid">
        {stats.map(([icon, title, value]) => (
          <div className="panel stat-card" key={title}>
            <span>
              <Icon name={icon} />
            </span>
            <p>{title}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {/* Biểu đồ bên trái đếm đơn theo tháng; danh sách bên phải là việc cần xử lý. */}
      <div className="dashboard-grid">
        <section className="panel">
          <h2>Đơn thuê theo thời gian</h2>
          <p className="muted">Số đơn tạo trong 6 tháng gần đây</p>
          <div
            className="bar-chart"
            role="img"
            aria-label={monthly.map((m) => `${m.label}: ${m.count} đơn`).join(', ')}
          >
            {/* Chiều cao cột lấy số đơn chia cho maximum để so sánh giữa các tháng. */}
            {monthly.map((m, i) => (
              <div className="chart-column" key={i}>
                <strong>{m.count}</strong>
                <div style={{ height: `${Math.max(3, (m.count / maximum) * 160)}px` }} />
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Cần bạn xử lý</h2>
          {tasks.map(([title, count]) => (
            <div className="summary-row" key={title}>
              <span>{title}</span>
              <strong>{count}</strong>
            </div>
          ))}
          <Link to="/admin/bookings" className="btn outline full">
            Xem đơn thuê
          </Link>
        </section>
      </div>
      <section className="panel">
        <div className="section-heading">
          <h2>Đơn thuê gần nhất</h2>
          <Link to="/admin/bookings" className="text-link">
            Xem tất cả
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Xe</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {/* Hook đã lấy tối đa 5 đơn mới nhất để hiển thị bảng tóm tắt. */}
              {recentOrders.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.name}</td>
                  <td>{b.carName}</td>
                  <td>{money(b.total)}</td>
                  <td>
                    <Badge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
