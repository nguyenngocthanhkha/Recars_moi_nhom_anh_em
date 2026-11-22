import { createContext, useContext } from 'react';
import useAppState from './useAppState';

// Tạo nơi chia sẻ dữ liệu, để các trang không phải truyền qua nhiều tầng props.
const AppContext = createContext(null);

// Chỉ cung cấp dữ liệu và hiển thị thông báo; xử lý nằm ở useAppState.js.
export function AppProvider({ children }) {
  // Nhận dữ liệu/hàm từ useAppState; tách riêng trạng thái tải và thông báo.
  const { toast, dismissToast, loading, error, ...value } = useAppState();
  return (
    <AppContext.Provider value={value}>
      {/* Đang tải thì hiện lời nhắn; lỗi tải ban đầu thì hiện nút thử lại. */}
      {loading ? (
        <div className="page-loader" role="status">
          Đang tải ReCars…
        </div>
      ) : error && !value.data.cars.length ? (
        <div className="container page">
          <div className="panel">
            <h1>Chưa kết nối được hệ thống</h1>
            <p>{error}</p>
            <button className="btn" onClick={() => value.refresh().catch(() => {})}>
              Thử kết nối lại
            </button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="connection-banner" role="alert">
              {error}
            </div>
          )}
          {children}
        </>
      )}
      {/* toast có nội dung thì hiện thông báo nổi; nút × đóng thông báo. */}
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button aria-label="Đóng thông báo" onClick={dismissToast}>
            ×
          </button>
        </div>
      )}
    </AppContext.Provider>
  );
}
// Các hook của trang gọi useApp() để lấy dữ liệu và hàm dùng chung.
export const useApp = () => useContext(AppContext);
