import { heroImage } from '../../../constants/data';
import { Button, Field, Link } from '../../../components/common/UI';
import useAuth from './useAuth';

// Chỉ hiển thị biểu mẫu; useAuth xử lý đăng nhập, đăng ký và khôi phục qua API.
export default function Auth({ type, params }) {
  // Hook cung cấp loại form, lỗi, trạng thái gửi và hàm xử lý; JSX dựng các ô bên dưới.
  const { show, setShow, error, busy, register, forgot, reset, submit } = useAuth({ type, params });
  return (
    <div className="container auth-layout">
      {/* Ảnh và lời giới thiệu bên cạnh form đăng nhập. */}
      <div className="auth-visual" style={{ backgroundImage: `url(${heroImage})` }}>
        <span className="eyebrow">RECARS · YOUR JOURNEY, YOUR WAY</span>
        <h2>
          Hành trình đẹp
          <br />
          bắt đầu từ đây.
        </h2>
        <p>
          Tự do lên kế hoạch.
          <br />
          An tâm trên từng cung đường.
        </p>
      </div>
      <section className="auth-form">
        <span className="eyebrow">CHÀO MỪNG ĐẾN VỚI RECARS</span>
        {/* Chọn tiêu đề theo trang: đăng ký, quên mật khẩu, đặt lại hoặc đăng nhập. */}
        <h1>
          {register
            ? 'Tạo tài khoản'
            : forgot
              ? 'Quên mật khẩu?'
              : reset
                ? 'Đặt lại mật khẩu'
                : 'Chào mừng trở lại'}
        </h1>
        <p className="muted">
          {forgot
            ? 'Nhập email để nhận liên kết khôi phục tài khoản.'
            : reset
              ? 'Chọn mật khẩu mới cho tài khoản của bạn.'
              : 'Tiếp tục lên kế hoạch cho hành trình của bạn.'}
        </p>
        {/* Gửi form gọi submit trong useAuth.js, nơi chọn đúng API cần gọi. */}
        <form onSubmit={submit}>
          {/* Họ tên và số điện thoại chỉ cần ở bước đăng ký tài khoản. */}
          {register && (
            <Field
              label="Họ và tên"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
            />
          )}
          {/* Trang đặt lại dùng token trong URL nên không nhập lại email. */}
          {!reset && (
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ban@example.com"
              required
            />
          )}
          {register && (
            <Field
              label="Số điện thoại"
              name="phone"
              type="tel"
              pattern="0[0-9]{9}"
              title="10 chữ số, bắt đầu bằng 0"
              required
            />
          )}
          {/* Trang quên mật khẩu chỉ nhập email; các trang còn lại nhập mật khẩu. */}
          {!forgot && (
            <>
              <Field label="Mật khẩu">
                <div className="password-input">
                  <input
                    name="password"
                    aria-label="Mật khẩu"
                    type={show ? 'text' : 'password'}
                    minLength={8}
                    maxLength={128}
                    required
                    autoComplete={register || reset ? 'new-password' : 'current-password'}
                    placeholder="Ít nhất 8 ký tự"
                  />
                  <button type="button" onClick={() => setShow(!show)}>
                    {show ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </Field>
              {/* Đăng ký hoặc đặt lại mật khẩu cần nhập thêm ô xác nhận. */}
              {(register || reset) && (
                <Field
                  label="Xác nhận mật khẩu"
                  name="confirm"
                  type={show ? 'text' : 'password'}
                  minLength={8}
                  maxLength={128}
                  required
                  autoComplete="new-password"
                />
              )}
              {!register && !reset && (
                <div className="align-right">
                  <Link to="/forgot-password" className="text-link">
                    Quên mật khẩu?
                  </Link>
                </div>
              )}
            </>
          )}
          {/* Hiện lỗi từ hook; khóa nút khi busy=true để tránh gửi nhiều lần. */}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <Button className="full" disabled={busy}>
            {busy
              ? 'Đang xử lý…'
              : register
                ? 'Tạo tài khoản'
                : forgot
                  ? 'Gửi liên kết khôi phục'
                  : reset
                    ? 'Đặt lại mật khẩu'
                    : 'Đăng nhập'}
          </Button>
        </form>
        {/* Liên kết chuyển qua lại giữa đăng nhập và đăng ký. */}
        <p className="auth-switch">
          {register ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
          <Link to={register ? '/login' : '/register'} className="text-link">
            {register ? 'Đăng nhập' : 'Đăng ký ngay'}
          </Link>
        </p>
      </section>
    </div>
  );
}
