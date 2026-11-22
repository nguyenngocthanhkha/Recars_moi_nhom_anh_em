import { Badge, Button, Confirm, Empty, Field, Modal, PageTitle } from '../../components/common/UI';
import { money, shortDate } from '../../utils/booking';
import { modeNames } from '../../constants/data';
import Pagination from './Pagination';
import useAdminBookings from './useAdminBookings';

// Bảng quản lý đơn dùng các nút chuyển trạng thái rõ ràng thay cho sửa tùy ý.

export default function AdminBookings() {
  // Nhận dữ liệu và hàm xử lý từ hook, bên dưới chỉ dựng giao diện.
  const {
    data,
    search,
    changeSearch,
    status,
    changeStatus,
    page,
    setPage,
    setSelected,
    confirm,
    setConfirm,
    order,
    filtered,
    assignDriver,
    confirmChange,
    confirmBooking,
    handOverCar,
    completeBooking,
    recordBalance,
    cancelBooking,
    availableDrivers,
  } = useAdminBookings();

  return (
    <>
      <PageTitle
        eyebrow="QUẢN LÝ VẬN HÀNH"
        title="Đơn thuê"
        text="Theo dõi hành trình từ đặt xe đến hoàn thành."
      />
      <div className="panel">
        {/* Tìm đơn theo mã/tên khách/xe và lọc theo trạng thái. */}
        <div className="toolbar">
          <input
            aria-label="Tìm đơn thuê"
            placeholder="Tìm mã đơn, khách hàng, tên xe…"
            value={search}
            onChange={changeSearch}
          />
          <select aria-label="Lọc trạng thái" value={status} onChange={changeStatus}>
            <option value="">Tất cả trạng thái</option>
            {['pending', 'paid', 'confirmed', 'renting', 'completed', 'cancelled', 'expired'].map(
              (s) => (
                <option key={s} value={s}>
                  {
                    {
                      pending: 'Chờ thanh toán cọc',
                      paid: 'Chờ xác nhận',
                      confirmed: 'Đã xác nhận',
                      renting: 'Đang thuê',
                      completed: 'Đã hoàn thành',
                      cancelled: 'Đã hủy',
                      expired: 'Đã hết hạn',
                    }[s]
                  }
                </option>
              ),
            )}
          </select>
        </div>
        {/* Có đơn thì dựng bảng của trang hiện tại, chưa có thì hiện lời nhắn. */}
        {filtered.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Đơn / khách hàng</th>
                  <th>Xe / hình thức</th>
                  <th>Thời gian</th>
                  <th>Chi phí</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * 8, page * 8).map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.id}</strong>
                      <small>{b.name}</small>
                    </td>
                    <td>
                      {b.carName}
                      <small>{modeNames[b.mode]}</small>
                    </td>
                    <td>
                      {shortDate(b.start)}
                      <small>đến {shortDate(b.end)}</small>
                    </td>
                    <td>
                      {money(b.total)}
                      <small>{b.depositPaid ? `Đã cọc ${money(b.deposit)}` : 'Chưa cọc'}</small>
                    </td>
                    <td>
                      <Badge status={b.status} />
                    </td>
                    <td>
                      <Button variant="outline small" onClick={() => setSelected(b.id)}>
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Không có đơn phù hợp" />
        )}
        <Pagination count={filtered.length} page={page} setPage={setPage} />
      </div>
      {/* Bấm xem đơn sẽ mở hộp chi tiết; thay đổi đơn do hook gửi qua API. */}
      {order && (
        <Modal title={`Đơn ${order.id}`} onClose={() => setSelected(null)}>
          <Badge status={order.status} />
          {/* Dựng các cặp nhãn/giá trị từ dữ liệu đơn backend đã trả. */}
          <div className="order-facts">
            {[
              ['Khách hàng', `${order.name} · ${order.phone}`],
              ['Xe', `${order.carName} · ${modeNames[order.mode]}`],
              ['Thời gian', `${shortDate(order.start)} – ${shortDate(order.end)}`],
              ['Nhận / trả', `${order.location} / ${order.dropoff}`],
              ['Tổng chi phí', money(order.total)],
              [
                'Tiền cọc',
                `${money(order.deposit)} · ${order.depositPaid ? 'Đã nhận' : 'Chưa nhận'}`,
              ],
              [
                'Còn lại',
                `${money(order.remaining)} · ${order.balancePaid ? 'Đã nhận' : 'Chưa nhận'}`,
              ],
              ['Ghi chú', order.note || 'Không có'],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          {/* Chỉ đơn có tài xế mới hiện ô phân công; khóa ô khi chưa cọc/chuyến đã khởi hành. */}
          {order.mode === 'driver' && (
            <Field label="Phân công tài xế">
              <select
                value={order.driverId || ''}
                disabled={!order.depositPaid || !['paid', 'confirmed'].includes(order.status)}
                onChange={(e) => assignDriver(e.target.value)}
              >
                <option value="">Chưa phân công</option>
                {availableDrivers.map((d) => (
                  <option value={d.id} key={d.id}>
                    {d.name} · {d.phone}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {/* Mỗi nút chuẩn bị một hành động, như xác nhận, bàn giao hoặc hoàn thành. */}
          <div className="actions">
            {order.status === 'paid' && <Button onClick={confirmBooking}>Xác nhận đơn</Button>}
            {order.status === 'confirmed' && (
              <Button disabled={order.mode === 'driver' && !order.driverId} onClick={handOverCar}>
                Bàn giao xe
              </Button>
            )}
            {order.status === 'renting' && <Button onClick={completeBooking}>Hoàn thành</Button>}
            {order.depositPaid &&
              !order.balancePaid &&
              ['confirmed', 'renting', 'completed'].includes(order.status) && (
                <Button variant="outline" onClick={recordBalance}>
                  Ghi nhận {money(order.remaining)}
                </Button>
              )}
            {['pending', 'paid', 'confirmed'].includes(order.status) && (
              <Button variant="ghost" onClick={cancelBooking}>
                Hủy đơn
              </Button>
            )}
          </div>
          <p className="muted small-text">
            Chỉ ghi nhận tiền còn lại sau khi đã thực nhận. Đơn đã cọc bị hủy cần đối soát hoàn tiền
            riêng.
          </p>
        </Modal>
      )}
      {/* Chỉ confirmChange sau khi Admin bấm xác nhận mới gửi yêu cầu cập nhật. */}
      {confirm && (
        <Confirm
          title={confirm.title}
          text="Xác nhận cập nhật đơn thuê này?"
          onClose={() => setConfirm(null)}
          onConfirm={confirmChange}
        />
      )}
    </>
  );
}
