import useDialog from './useDialog';
import { statusNames } from '../../constants/data';

// Icon SVG dùng chung: nét vẽ và kích thước nhất quán, không cần thư viện ngoài.
const paths = {
  car: 'M3 13l2-6h14l2 6v6h-3v-3H6v3H3v-6Zm0 0h18M7 13h.01M17 13h.01',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  calendar: 'M5 5h14v16H5zM8 2v6M16 2v6M5 10h14',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 22v-3a8 8 0 0 1 16 0v3',
  shield: 'M12 2l9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4Zm-5 10 3 3 7-7',
  check: 'M5 12l4 4L20 5',
  gear: 'M6 3v18M18 3v9M6 12h12M3 3h6M15 3h6M3 21h6',
  fuel: 'M3 21V3h10v18M3 11h10M1 21h14M16 5l4 4v10a2 2 0 0 1-4 0v-6h-3',
  star: 'm12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z',
  clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M12 6v6l4 2',
  menu: 'M3 6h18M3 12h18M3 18h18',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  wallet: 'M3 6h18v15H3zM3 6V3h15v3M16 11h5v5h-5z',
  heart: 'M20 5c-4-4-8 1-8 1S8 1 4 5c-5 5 8 15 8 15S25 10 20 5Z',
  phone: 'm5 3 4 4-3 3c2 4 4 6 8 8l3-3 4 4c-5 8-22-9-16-16Z',
  mail: 'M2 5h20v14H2zM2 5l10 8L22 5',
  chevron: 'm9 5 7 7-7 7',
};
// Chọn nét vẽ theo name để dựng biểu tượng SVG với kích thước size.
export function Icon({ name = 'car', size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.car} />
    </svg>
  );
}

// Thẻ liên kết gốc hỗ trợ bàn phím và mở trang trong tab mới.
export function Link({ to, className = '', children, ...props }) {
  return (
    <a href={`#${to}`} className={className} {...props}>
      {children}
    </a>
  );
}
// Nút dùng chung; children là chữ/nội dung bên trong, props nhận onClick/disabled...
export function Button({ children, variant = '', className = '', ...props }) {
  return (
    <button className={`btn ${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
// Ghép nhãn, ô nhập và lỗi; có children thì dùng ô tùy chỉnh như select/textarea.
export function Field({ label, error, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input {...props} />} {error && <small className="error">{error}</small>}
    </label>
  );
}
// Đổi mã trạng thái sang nhãn tiếng Việt và màu CSS tương ứng.
export function Badge({ status }) {
  return <span className={`badge ${status}`}>{statusNames[status] || status}</span>;
}
// Khối thông báo dùng khi danh sách rỗng hoặc không tìm thấy dữ liệu.
export function Empty({
  title = 'Chưa có dữ liệu',
  text = 'Thông tin sẽ xuất hiện tại đây khi bạn bắt đầu.',
  children,
}) {
  return (
    <div className="empty">
      <Icon name="car" size={44} />
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
// Tiêu đề trang dùng chung; children có thể là nút thêm mới bên cạnh tiêu đề.
export function PageTitle({ eyebrow, title, text, children }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {children}
    </div>
  );
}

// Dialog gốc hỗ trợ phím Escape, giữ focus và tự trả focus khi đóng.
export function Modal({ title, onClose, children }) {
  const { ref, closeOnBackdrop } = useDialog(onClose);
  return (
    <dialog ref={ref} className="modal" onCancel={onClose} onClick={closeOnBackdrop}>
      <div className="modal-top">
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Đóng hộp thoại">
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
// Hộp xác nhận có nút quay lại và xác nhận; hành động thật do onConfirm thực hiện.
export function Confirm({ title, text, onClose, onConfirm }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p>{text}</p>
      <div className="actions">
        <Button variant="outline" onClick={onClose}>
          Quay lại
        </Button>
        <Button onClick={onConfirm}>Xác nhận</Button>
      </div>
    </Modal>
  );
}
