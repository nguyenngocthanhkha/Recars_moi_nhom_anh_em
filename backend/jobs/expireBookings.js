import { expirePendingBookings } from '../services/bookingService.js';
import { reconcilePayments } from '../services/paymentSync.js';

// Chạy trên backend ngay cả khi khách đã đóng trình duyệt.
export function startExpiryJob() {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      await expirePendingBookings();
      await reconcilePayments();
    } catch (error) {
      console.error('Lỗi xử lý đơn/thanh toán:', error.message);
    } finally {
      running = false;
    }
  };
  run();
  const timer = setInterval(run, 60000);
  timer.unref();
  return () => clearInterval(timer);
}
