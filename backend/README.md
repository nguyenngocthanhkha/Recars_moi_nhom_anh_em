# Backend ReCars

Backend nằm hoàn toàn trong `backend/`. React không kết nối MongoDB trực tiếp.

## Cây thư mục để đọc code

```text
backend/
├── config/          Cấu hình kết nối MongoDB
├── models/          Cấu trúc dữ liệu và index
├── routes/          Đường dẫn API
├── middlewares/     Đăng nhập, phân quyền và xử lý lỗi
├── controllers/     Nhận request, gọi xử lý, trả response
├── validators/      Kiểm tra dữ liệu đầu vào
├── services/        Xử lý nghiệp vụ
├── utils/           Hàm hỗ trợ dùng chung
├── jobs/            Tự xử lý đơn hết hạn, đồng bộ thanh toán
├── scripts/         Khởi tạo dữ liệu
├── app.js           Ghép cấu hình Express, API và xử lý lỗi
├── server.js        Kết nối MongoDB và khởi chạy backend
├── package.json     Thư viện và lệnh chạy
├── .env             Cấu hình local
├── .env.example     Cấu hình mẫu
├── .recars-accounts.txt  Tài khoản được sinh khi seed
└── README.md        Hướng dẫn này
```

Các thư mục trống và file `.gitkeep` đã được dọn. Trong VS Code, `fixtures.js` được thu gọn dưới `scripts/seed.js`: bấm mũi tên để mở. Đây là dữ liệu khởi tạo cho lệnh seed; mã nguồn và dữ liệu MongoDB vẫn được giữ nguyên.

Khi học một API, đọc theo thứ tự: `routes/api.js` → middleware → controller → service → model. `app.js` cấu hình ứng dụng; `server.js` khởi chạy ứng dụng.

## Các giai đoạn

| Giai đoạn            | Đã triển khai                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| 1. Express           | app.js, server.js, CORS/JSON, health, lỗi JSON                                                           |
| 2. MongoDB           | Mongoose, ping, chờ kết nối trước khi mở API                                                             |
| 3. Models            | User, Car, Driver, Booking, Payment, Review                                                              |
| 4. API cơ bản        | Đăng ký/đăng nhập, cookie, quyền, CRUD mềm xe/tài xế, khách hàng                                         |
| 5. Đặt xe            | Tính tiền/cọc ở server, index chống trùng, giữ 72 giờ, job hết hạn                                       |
| 6. Thanh toán/tài xế | Tạo URL VNPAY, xác minh IPN, idempotency, phân công sau cọc; cần tài khoản Sandbox để chạy qua cổng thật |
| 7. Đánh giá/kiểm thử | Đánh giá sau hoàn thành, kiểm duyệt, kiểm thử MongoDB/API/Chrome, OpenAPI cho Thunder Client             |

## Khởi động

Từ `C:\RECARS`: `npm run seed` rồi `npm run dev:backend`. Seed là lệnh bổ sung bản ghi còn thiếu, không reset database. Xem tài khoản tại `backend/.recars-accounts.txt`.

Thứ tự server.js: kết nối MongoDB → chờ 6 model/index sẵn sàng → mở cổng API → job hết hạn. Nếu database không kết nối được, không mở API. Index duy nhất trên carId + từng ngày thuê và driverId + từng ngày thuê chặn xung đột kể cả khi hai request tới cùng lúc; không đòi hỏi MongoDB chạy replica set cho giao dịch này.

6 collection: `users`, `cars`, `drivers`, `bookings`, `payments`, `reviews`. Các quan hệ dùng id chuỗi, ví dụ booking.carId → car.id. Giá, tên và ảnh xe được chốt trong đơn để lịch sử vẫn rõ khi xe bị sửa hoặc ẩn.

## Phân lớp code

| Thư mục/file                | Vai trò                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| routes/api.js               | Chọn controller và middleware theo URL                             |
| middlewares/auth.js         | Đọc phiên, kiểm tra đăng nhập/Admin, nguồn request và giới hạn thử |
| middlewares/errorHandler.js | Xử lý lỗi tập trung, chuẩn hóa mã HTTP và thông báo                |
| controllers/                | Đọc input, gọi service/model, trả JSON                             |
| services/bookingService.js  | Tiền thuê, tiền cọc, giữ xe, hết hạn và trạng thái đơn             |
| services/vnpayService.js    | Tham số VNPAY, chữ ký và xác minh IPN                              |
| services/password.js        | Hash/so sánh mật khẩu và hash token                                |
| services/mail.js            | Gửi email qua SMTP                                                 |
| models/                     | Cấu trúc dữ liệu và index MongoDB                                  |
| jobs/expireBookings.js      | Xử lý đơn hết hạn mỗi 60 giây                                      |
| validators/input.js         | Kiểm tra và lọc dữ liệu đầu vào                                    |
| utils/http.js               | Hàm tạo lỗi có mã HTTP và trả response dùng chung                  |

## API chính

URL gốc: `http://localhost:5000/api`. JSON thành công: `{ "success": true, "data": ... }`. Lỗi: `{ "success": false, "message": "..." }`. Health và IPN có response riêng.

| API                                                    | Quyền                                                |
| ------------------------------------------------------ | ---------------------------------------------------- |
| GET /health, /bootstrap, /cars, /cars/:id              | Công khai; bootstrap lọc dữ liệu riêng tư theo phiên |
| POST /auth/register, /auth/login                       | Công khai, có giới hạn thử                           |
| GET /auth/me, POST /auth/logout                        | Đọc/thu hồi phiên                                    |
| PATCH /auth/profile, POST /auth/change-password        | Người đăng nhập, chỉ tài khoản mình                  |
| POST /auth/forgot-password, /auth/reset-password       | Email/token, cần SMTP                                |
| GET/POST /bookings, GET/PATCH /bookings/:id            | Chủ đơn hoặc Admin; mỗi hành động kiểm tra riêng     |
| POST /reviews                                          | Người có đơn của mình đã hoàn thành                  |
| POST /payments/checkout                                | Chủ đơn chờ cọc, cần cấu hình VNPAY                  |
| GET /payments/vnpay-ipn                                | Chữ ký VNPAY hợp lệ                                  |
| GET /payments/vnpay-return                             | Chỉ xác minh và chuyển về frontend                   |
| GET /admin/cars, /drivers, /users, /reviews, /payments | Admin                                                |
| POST /admin/cars, /admin/drivers                       | Admin                                                |
| PATCH /admin/:collection/:id                           | Admin, chỉ trường được cho phép                      |

PATCH đơn: `{ "status": "cancelled" }` để hủy; Admin dùng `confirmed`, `renting`, `completed` theo thứ tự, `{ "driverId": "d1" }` để phân công, `{ "balancePaid": true }` sau khi thực nhận phần còn lại. Client không được tự đặt depositPaid, total, userId hoặc nâng role.

## Kiểm tra bằng Thunder Client

1. Mở Collections → Import → chọn `docs/openapi.json` (OpenAPI v3).
2. Gửi GET /health: mong đợi 200, database connected.
3. Gửi POST /auth/login với tài khoản trong file cục bộ. Kiểm tra Set-Cookie. Nếu công cụ không tự gửi cookie, thêm header `Cookie: recars_session=<token từ Set-Cookie>` vào request cần quyền. Không chia sẻ token.
4. Gửi POST /bookings, sửa ngày trong ví dụ thành tương lai và giữ id trả về.
5. Thử đặt trùng: 409. Thử thay total/deposit trong payload: server vẫn tính theo giá MongoDB.
6. Dùng Customer gọi GET /admin/users: 403. Gọi đơn người khác: 404.
7. Chưa cọc mà chuyển confirmed hoặc phân công tài xế: 409.
8. Khi có VNPAY Sandbox, tạo checkout, dùng dữ liệu thử nghiệm của VNPAY và kiểm tra IPN trước khi Admin xác nhận.
9. Hoàn thành đơn → POST /reviews; gửi lại cùng bookingId: 409.

Cookie HttpOnly vẫn được gửi cùng request HTTP; trình duyệt không đọc token bằng JavaScript. Một tài khoản có một phiên hoạt động; đăng nhập lại hoặc đổi mật khẩu làm token cũ không còn hợp lệ. Mật khẩu dùng scrypt + salt; chỉ hash được lưu. Token khôi phục chỉ nằm trong email, hash và hạn 15 phút nằm trong database, sử dụng được một lần.

## Cấu hình VNPAY Sandbox

Điền trực tiếp trong `backend/.env`:

```dotenv
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_RETURN_URL=http://localhost:5000/api/payments/vnpay-return
```

Giữ trống đến khi có thông tin tài khoản thật do VNPAY cấp; không đưa secret vào frontend. URL IPN đăng ký với VNPAY là `https://<backend-cong-khai>/api/payments/vnpay-ipn`. VNPAY không thể gọi localhost trên máy bạn; cần backend công khai có HTTPS và cấu hình URL phù hợp. Hệ thống chưa được triển khai lên hosting.

IPN kiểm tra merchant, HMAC-SHA512, số tiền và mã giao dịch. Return URL không tự xác nhận tiền. Callback được xử lý lặp an toàn; giao dịch đến sau hết hạn/hủy hoặc cọc trùng được lưu và đánh dấu đối soát, không tự giữ lại xe. Refund API chưa được triển khai; Admin xử lý hoàn tiền riêng.

## Cấu hình SMTP và email nhóm

Điền SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, MAIL_FROM; thêm CONTACT_EMAIL để nhận liên hệ. Cổng 587 dùng STARTTLS (`SMTP_SECURE=false`), cổng 465 dùng TLS ngay (`SMTP_SECURE=true`). Không gửi khóa/mật khẩu qua chat. Chưa có cấu hình thì API báo 503; không có email giả hoặc reset token trả trực tiếp ra API.

## Kiểm thử

`npm test`: kiểm tra công thức và 18 trường hợp API với database riêng. `npm run test:ui`: Chrome với backend và MongoDB riêng. Kiểm thử bao gồm tranh chấp cùng xe/tài xế, quyền sở hữu, callback giả/sai tiền/lặp/đến trễ, đổi và khôi phục mật khẩu, đánh giá trùng. SMTP được mock, IPN dùng chữ ký kiểm thử; cần xác minh giao dịch trên cổng VNPAY và SMTP thực tế sau khi cung cấp tài khoản.

Tài liệu chính thức: [MongoDB unique index](https://www.mongodb.com/docs/manual/core/index-unique/), [Mongoose](https://mongoosejs.com/docs/connections.html), [VNPAY 2.1.0](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html), [VNPAY Return/IPN](https://sandbox.vnpayment.vn/apis/docs/faqs/), [Nodemailer SMTP](https://nodemailer.com/smtp), [Thunder Client import](https://docs.thunderclient.com/features/import).
