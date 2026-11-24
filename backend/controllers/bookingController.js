import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import {
  createBooking,
  updateBooking,
  findAccessibleBooking,
  expirePendingBookings,
} from '../services/bookingService.js';
import { fail, send } from '../utils/http.js';
import { text } from '../validators/input.js';

export async function listBookings(req, res) {
  await expirePendingBookings();
  send(
    res,
    await Booking.find(req.user.role === 'admin' ? {} : { userId: req.user.id }).sort({
      createdAt: -1,
    }),
  );
}
export async function getBooking(req, res) {
  send(res, await findAccessibleBooking(req.params.id, req.user));
}
export async function postBooking(req, res) {
  send(res, await createBooking(req.body, req.user), 201);
}
export async function patchBooking(req, res) {
  send(res, await updateBooking(req.params.id, req.body || {}, req.user));
}

// Người viết phải là chủ đơn đã hoàn thành; tên và carId lấy từ server.
export async function postReview(req, res) {
  const bookingId = text(req.body, 'bookingId');
  const order = await Booking.findOne({ _id: bookingId, userId: req.user.id, status: 'completed' });
  if (!order) fail(403, 'Chỉ được đánh giá chuyến đi của bạn đã hoàn thành.');
  send(
    res,
    await Review.create({
      bookingId,
      userId: req.user.id,
      carId: order.carId,
      name: req.user.name,
      stars: req.body.stars,
      text: text(req.body, 'text', 10, 1000),
    }),
    201,
  );
}
