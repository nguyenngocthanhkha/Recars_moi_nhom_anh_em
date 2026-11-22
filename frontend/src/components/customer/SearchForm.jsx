import { Icon, Button, Field } from '../common/UI';
import { dateAfter, today } from '../../utils/booking';
import useSearchForm from './useSearchForm';

// Form tìm kiếm truyền điều kiện qua URL để danh sách xe đọc lại được.

export default function SearchForm({ initial = {} }) {
  // Nhận dữ liệu và hàm xử lý từ hook, bên dưới chỉ dựng giao diện.
  const { mode, setMode, start, changeStart, end, setEnd, submit } = useSearchForm({ initial });

  return (
    <div className="search-panel">
      {/* Hai nút đổi hình thức thuê; hình thức đang chọn được tô lớp selected. */}
      <div className="rental-tabs" role="group" aria-label="Hình thức thuê">
        <button className={mode === 'self' ? 'selected' : ''} onClick={() => setMode('self')}>
          <Icon name="car" />
          Thuê xe tự lái
        </button>
        <button className={mode === 'driver' ? 'selected' : ''} onClick={() => setMode('driver')}>
          <Icon name="user" />
          Thuê xe có tài xế
        </button>
      </div>
      {/* Gửi form sẽ chuyển sang danh sách xe, mang bộ lọc theo URL. */}
      <form className="search-fields" onSubmit={submit}>
        <Field
          label={
            <>
              <Icon name="pin" size={17} /> Địa điểm nhận xe
            </>
          }
        >
          <select name="location" defaultValue={initial.location || 'Quy Nhơn'}>
            <option>Quy Nhơn</option>
          </select>
        </Field>
        {/* Chọn ngày nhận từ hôm nay; hook tự đẩy ngày trả nếu ngày mới không hợp lệ. */}
        <Field
          label={
            <>
              <Icon name="calendar" size={17} /> Ngày nhận xe
            </>
          }
          type="date"
          min={today()}
          value={start}
          required
          onChange={changeStart}
        />
        {/* Ngày trả sớm nhất là sau ngày nhận 1 ngày. */}
        <Field
          label={
            <>
              <Icon name="calendar" size={17} /> Ngày trả xe
            </>
          }
          type="date"
          min={dateAfter(start, 1)}
          value={end}
          required
          onChange={(e) => setEnd(e.target.value)}
        />
        <Button>
          <Icon name="search" size={19} />
          Tìm xe phù hợp
        </Button>
      </form>
    </div>
  );
}
