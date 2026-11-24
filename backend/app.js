import express from 'express';
import cors from 'cors';
import { checkDatabase } from './config/database.js';
import api from './routes/api.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Khởi tạo ứng dụng; file này cấu hình Express, chưa mở cổng mạng.
const app = express();

// Cho phép frontend gọi API và đọc dữ liệu JSON trong request.
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '100kb' }));

// Đường dẫn gốc giúp nhận biết đúng backend khi mở trên trình duyệt.
app.get('/', (req, res) => {
  res.json({ success: true, message: 'ReCars API' });
});

// Trả 200 khi database phản hồi; 503 nếu MongoDB chưa sẵn sàng.
app.get('/api/health', async (req, res) => {
  const connected = await checkDatabase();
  res.status(connected ? 200 : 503).json({
    success: connected,
    message: connected ? 'Express và MongoDB đang hoạt động' : 'MongoDB chưa sẵn sàng',
    database: connected ? 'connected' : 'disconnected',
  });
});

app.use('/api', api);

// Trả về JSON khi người dùng gọi đường dẫn chưa được xây dựng.
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Không tìm thấy API' });
});

app.use(errorHandler);

export default app;
