# ReCars · Nhóm anh em

Mã nguồn frontend website thuê xe ReCars, sử dụng React, Vite và Tailwind/CSS.

## Cấu trúc

- `frontend/src/pages/`: trang khách hàng và quản trị, kèm hook xử lý.
- `frontend/src/components/`: thành phần giao diện dùng chung.
- `frontend/src/context/`: dữ liệu chia sẻ và tải lại dữ liệu từ API.
- `frontend/src/services/api.js`: kết nối backend.
- `frontend/src/styles/`: CSS và responsive.
- `frontend/public/`: logo và tài nguyên tĩnh.

## Chạy frontend

Cài Node.js 24.14.x (hoặc phiên bản 24 mới hơn), mở terminal tại thư mục gốc repository:

```powershell
npm install
Copy-Item frontend/.env.example frontend/.env
npm run dev
```

Website: http://localhost:5173. Quản trị: http://localhost:5173/#/admin.

```powershell
npm run build
npm run preview
```

Kết quả build nằm trong `frontend/dist/`.

## Kết nối backend

Repository này chứa phần frontend. Các chức năng tải danh sách xe, đăng nhập, đặt xe, thanh toán và quản trị cần backend ReCars đang hoạt động.

Mặc định `VITE_API_BASE_URL=/api`; Vite chuyển tiếp `/api` đến `http://localhost:5000` khi chạy phát triển.

Để dùng backend ở địa chỉ khác, sửa `frontend/.env` rồi khởi động lại Vite:

```dotenv
VITE_API_BASE_URL=https://dia-chi-backend/api
```

Backend cần cho phép origin của frontend và hỗ trợ cookie đăng nhập. Khi triển khai bản build, cấu hình URL API trước lúc build hoặc cấu hình hosting chuyển tiếp `/api` đến backend.

Không commit `.env`, `node_modules/` và `dist/`. File `.env.example` chỉ chứa cấu hình công khai mẫu.
