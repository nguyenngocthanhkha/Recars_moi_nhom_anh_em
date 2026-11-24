import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import * as catalog from '../controllers/catalogController.js';
import * as booking from '../controllers/bookingController.js';
import * as payment from '../controllers/paymentController.js';

import {
  readSession,
  requireUser,
  requireAdmin,
  limitAuth,
  protectOrigin,
} from '../middlewares/auth.js';
import { send } from '../utils/http.js';

const router = Router();
router.use(protectOrigin, readSession);

// Đọc công khai; bootstrap tự lọc dữ liệu riêng tư theo phiên đăng nhập.
router.get('/bootstrap', catalog.bootstrap);
router.get('/cars', catalog.listCars);
router.get('/cars/:id', catalog.getCar);
router.post('/contact', limitAuth, catalog.contact);
router.get('/auth/me', (req, res) => send(res, req.user));
router.post('/auth/register', limitAuth, auth.register);
router.post('/auth/login', limitAuth, auth.login);
router.post('/auth/logout', auth.logout);
router.post('/auth/forgot-password', limitAuth, auth.forgotPassword);
router.post('/auth/reset-password', limitAuth, auth.resetPassword);
router.patch('/auth/profile', requireUser, auth.profile);
router.post('/auth/change-password', requireUser, auth.changePassword);

// Các chức năng khách hàng và Admin đều kiểm tra phiên ở backend.
router.get('/bookings', requireUser, booking.listBookings);
router.get('/bookings/:id', requireUser, booking.getBooking);
router.post('/bookings', requireUser, booking.postBooking);
router.patch('/bookings/:id', requireUser, booking.patchBooking);
router.post('/reviews', requireUser, booking.postReview);
router.post('/payments/checkout', requireUser, payment.createPayment);
router.post('/payments/sepay-checkout', requireUser, payment.createSePayPayment);
router.get('/payments/vnpay-ipn', payment.ipn);
router.get('/payments/vnpay-return', payment.returnUrl);
router.post('/payments/sepay-ipn', payment.sepayIpn);
// Chỉ Admin được truy cập các API quản lý danh mục.
router.get('/admin/:collection', requireAdmin, catalog.listRecords);
router.post('/admin/:collection', requireAdmin, catalog.createRecord);
router.patch('/admin/:collection/:id', requireAdmin, catalog.updateRecord);
export default router;
