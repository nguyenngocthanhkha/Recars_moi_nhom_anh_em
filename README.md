# Recars_moi_nhom_anh_em

## Chạy giao diện

Dùng Node.js 24 và chạy từ thư mục gốc của repo.

```bash
npm --prefix frontend ci
npm --prefix frontend run dev
```

Mở http://localhost:5173. Vite chuyển các yêu cầu `/api` đến backend ReCars tại `http://localhost:5000`. Chạy backend từ repo [WEB_RECARS-](https://github.com/nguyenngocthanhkha/WEB_RECARS-) hoặc đặt biến môi trường `VITE_API_PROXY_TARGET` trước khi chạy Vite nếu backend dùng địa chỉ khác.

Tạo bản build bằng `npm --prefix frontend run build`. Khi triển khai, cấu hình máy chủ chuyển tiếp `/api` đến backend hoặc đặt `VITE_API_BASE_URL` trước khi build.
