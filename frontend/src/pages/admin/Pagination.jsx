// Phân trang dùng chung, mỗi trang hiển thị tối đa 8 bản ghi.
export default function Pagination({ count, page, setPage }) {
  return (
    <div className="pagination">
      {/* Làm tròn lên số trang; bấm nút gọi setPage để đổi danh sách đang hiển thị. */}
      {Array.from({ length: Math.ceil(count / 8) }, (_, i) => (
        <button className={page === i + 1 ? 'selected' : ''} key={i} onClick={() => setPage(i + 1)}>
          {i + 1}
        </button>
      ))}
    </div>
  );
}
