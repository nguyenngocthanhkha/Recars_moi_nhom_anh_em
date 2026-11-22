import { money } from '../../utils/booking';

// Bảng chi phí chung giúp người dùng luôn thấy riêng tiền cọc và tiền còn lại.
export default function CostSummary({ cost }) {
  return (
    <div className="cost-summary">
      <div className="summary-row">
        <span>Tiền xe · {cost.days} ngày</span>
        <strong>{money(cost.rental ?? cost.total - cost.driverFee)}</strong>
      </div>
      {/* Chỉ hiện dòng phí tài xế khi hình thức thuê có phát sinh khoản này. */}
      {cost.driverFee > 0 && (
        <div className="summary-row">
          <span>Phí tài xế · {cost.days} ngày</span>
          <strong>{money(cost.driverFee)}</strong>
        </div>
      )}
      <div className="summary-row total">
        <span>Tổng chi phí</span>
        <strong>{money(cost.total)}</strong>
      </div>
      {/* Tách tiền cọc cần thanh toán trước khỏi tổng chi phí. */}
      <div className="deposit-box">
        <div className="summary-row">
          <span>Tiền cọc ({Math.round((cost.rate ?? cost.deposit / cost.total) * 100)}%)</span>
          <strong>{money(cost.deposit)}</strong>
        </div>
        <small>Thanh toán trực tuyến để giữ xe</small>
      </div>
      {/* remaining là phần tiền còn lại sau khi trừ cọc. */}
      <div className="summary-row">
        <span>Còn lại khi nhận xe</span>
        <strong>{money(cost.remaining)}</strong>
      </div>
    </div>
  );
}
