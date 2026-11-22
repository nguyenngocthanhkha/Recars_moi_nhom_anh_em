import { Empty, Field, PageTitle, Button } from '../../../components/common/UI';
import CarCard from '../../../components/customer/CarCard';
import SearchForm from '../../../components/customer/SearchForm';
import useCars from './useCars';

// Các bộ lọc cùng tác động lên một mảng xe; không nhân đôi dữ liệu.

export default function Cars({ params }) {
  // Nhận dữ liệu và hàm xử lý từ hook, bên dưới chỉ dựng giao diện.
  const {
    brands,
    brand,
    setBrand,
    type,
    setType,
    seats,
    setSeats,
    maxPrice,
    setMaxPrice,
    sort,
    setSort,
    page,
    setPage,
    onlyAvailable,
    setOnlyAvailable,
    filtered,
    visibleCars,
    reset,
    changeFilter,
  } = useCars({ params });

  // Dựng ô chọn dùng lại cho hãng, loại và số chỗ; đổi lựa chọn gọi hook lọc xe.
  const select = (label, value, setter, options) => (
    <Field label={label}>
      <select value={value} onChange={changeFilter(setter)}>
        <option value="">Tất cả</option>
        {options.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </Field>
  );
  return (
    <div className="container page">
      <PageTitle
        eyebrow="KHÁM PHÁ BỘ SƯU TẬP"
        title="Tìm người bạn đồng hành"
        text="Một chiếc xe phù hợp cho mỗi hành trình của bạn."
      />
      {/* Điền lại bộ lọc từ URL vào form tìm xe. */}
      <SearchForm key={params.toString()} initial={Object.fromEntries(params)} />
      <div className="listing-layout">
        {/* Cột trái: hãng, loại, số chỗ, mức giá và tùy chọn chỉ hiện xe trống. */}
        <aside className="panel filter-panel">
          <h3>Bộ lọc tìm kiếm</h3>
          {select('Hãng xe', brand, setBrand, brands)}
          {select('Loại xe', type, setType, ['SUV', 'Sedan', 'Thể thao'])}
          {select('Số chỗ ngồi', seats, setSeats, [2, 4, 5, 7])}
          <Field label={`Giá tối đa: ${Number(maxPrice).toLocaleString('vi-VN')}đ/ngày`}>
            <input
              type="range"
              min="500000"
              max="5000000"
              step="100000"
              value={maxPrice}
              onChange={changeFilter(setMaxPrice)}
            />
          </Field>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            Chỉ xe có thể đặt
          </label>
          <p className="muted small-text">
            Tình trạng xe được kiểm tra theo ngày nhận và trả đã chọn.
          </p>
          <Button variant="outline" onClick={reset}>
            Xóa bộ lọc
          </Button>
        </aside>
        <section>
          {/* Cột phải: số kết quả và cách sắp xếp giá. */}
          <div className="results-bar">
            <p>
              <strong>{filtered.length}</strong> xe phù hợp
            </p>
            <label className="sort-label">
              Sắp xếp
              <select aria-label="Sắp xếp xe" value={sort} onChange={changeFilter(setSort)}>
                <option value="default">Đề xuất</option>
                <option value="asc">Giá thấp đến cao</option>
                <option value="desc">Giá cao đến thấp</option>
              </select>
            </label>
          </div>
          {/* Có kết quả thì dựng thẻ xe; không có thì hiện lời nhắn và nút đặt lại. */}
          {filtered.length ? (
            <>
              <div className="car-grid listing-grid">
                {visibleCars.map((car) => (
                  <CarCard key={car.id} car={car} query={params.toString()} />
                ))}
              </div>
              {/* Chia danh sách thành các trang, mỗi trang tối đa 6 xe. */}
              <div className="pagination">
                {Array.from({ length: Math.ceil(filtered.length / 6) }, (_, i) => (
                  <button
                    key={i}
                    className={page === i + 1 ? 'selected' : ''}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <Empty title="Chưa tìm thấy xe phù hợp" text="Thử đổi ngày thuê hoặc nới rộng bộ lọc.">
              <Button variant="outline" onClick={reset}>
                Đặt lại bộ lọc
              </Button>
            </Empty>
          )}
        </section>
      </div>
    </div>
  );
}
