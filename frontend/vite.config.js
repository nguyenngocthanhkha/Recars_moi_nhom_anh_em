import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Cho Vite hiểu JSX của React và xử lý CSS của Tailwind.
  plugins: [react(), tailwindcss()],
  server: {
    // Website chạy cổng 5173; báo lỗi nếu cổng bận thay vì tự đổi sang cổng khác.
    port: 5173,
    strictPort: true,
    // Khi phát triển, yêu cầu /api được chuyển tiếp đến backend cổng 5000.
    proxy: { '/api': process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000' },
  },
});
