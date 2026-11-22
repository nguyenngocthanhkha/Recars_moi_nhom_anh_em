import { Empty, PageTitle } from '../../components/common/UI';
import { money } from '../../utils/booking';
import Pagination from './Pagination';
import usePayments from './usePayments';

// Bảng đối soát tiền cọc, bao gồm giao dịch cần xử lý hoàn tiền riêng.
export default function Payments() {
  const { records, search, status, page, setPage, changeSearch, changeStatus } = usePayments();
  // Đổi trạng thái kỹ thuật từ API thành nhãn tiếng Việt trong bảng và bộ lọc.
  const names = {
    pending: 'Chờ thanh toán',
    succeeded: 'Đã nhận tiền',
    failed: 'Không thành công',
  };
  return (
    <>
      <PageTitle
        eyebrow="ĐỐI SOÁT RECARS"
        title="Thanh toán"
        text="Theo dõi từng giao dịch tiền cọc và các trường hợp cần xử lý."
      />
      <section className="panel">
        {/* Tìm theo mã giao dịch/mã đơn, kết hợp bộ lọc trạng thái. */}
        <div className="toolbar">
          <input
            aria-label="Tìm giao dịch"
            placeholder="Mã giao dịch hoặc đơn thuê…"
            value={search}
            onChange={changeSearch}
          />
          <select aria-label="Lọc giao dịch" value={status} onChange={changeStatus}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(names).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>
        {/* Dữ liệu lấy từ backend; bảng chỉ đọc và chia mỗi trang tối đa 8 giao dịch. */}
        {records.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Giao dịch / đơn thuê</th>
                  <th>Số tiền</th>
                  <th>Kết quả</th>
                  <th>Đối soát</th>
                </tr>
              </thead>
              <tbody>
                {records.slice((page - 1) * 8, page * 8).map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.id}
                      <small>{item.bookingId}</small>
                      <small>VNPAY: {item.transactionNo || 'Chưa có'}</small>
                    </td>
                    <td>{money(item.amount)}</td>
                    <td>
                      <span
                        className={`badge ${item.status === 'succeeded' ? 'completed' : item.status === 'failed' ? 'cancelled' : 'pending'}`}
                      >
                        {names[item.status]}
                      </span>
                    </td>
                    <td>
                      {/* Cờ này báo cần đối soát, không có nghĩa hệ thống đã tự hoàn tiền. */}
                      {item.refundRequired ? (
                        <span className="badge cancelled">Cần đối soát hoàn tiền</span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Chưa có giao dịch phù hợp"
            text="Giao dịch được tạo khi khách chuyển sang VNPAY."
          />
        )}
        <Pagination count={records.length} page={page} setPage={setPage} />
      </section>
    </>
  );
}
