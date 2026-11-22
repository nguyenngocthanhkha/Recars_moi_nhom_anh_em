import { Badge, Button, Confirm, Empty, Field, Modal, PageTitle } from '../../components/common/UI';
import { money, shortDate } from '../../utils/booking';
import Pagination from './Pagination';
import useEntityManager from './useEntityManager';

// Cấu hình biểu mẫu giúp dùng chung bảng CRUD mà vẫn dễ đọc từng trường dữ liệu.

export default function EntityManager({ section }) {
  // Nhận dữ liệu và hàm xử lý từ hook, bên dưới chỉ dựng giao diện.
  const {
    data,
    title,
    search,
    changeSearch,
    filter,
    changeFilter,
    page,
    setPage,
    editing,
    setEditing,
    history,
    setHistory,
    confirmation,
    setConfirmation,
    fields,
    records,
    toggle,
    save,
    confirmToggle,
    historyBookings,
  } = useEntityManager({ section });

  return (
    <>
      <PageTitle
        eyebrow="DỮ LIỆU RECARS"
        title={title}
        text="Tìm kiếm, xem và cập nhật thông tin trong một nơi."
      >
        {['cars', 'drivers'].includes(section) && (
          <Button onClick={() => setEditing({})}>
            + Thêm {section === 'cars' ? 'xe' : 'tài xế'}
          </Button>
        )}
      </PageTitle>
      <div className="panel">
        {/* Tìm kiếm và lọc trạng thái trong danh mục Admin đang mở. */}
        <div className="toolbar">
          <input
            aria-label={`Tìm ${title}`}
            placeholder="Tìm kiếm theo tên, email hoặc biển số…"
            value={search}
            onChange={changeSearch}
          />
          <select aria-label="Lọc trạng thái hiển thị" value={filter} onChange={changeFilter}>
            <option value="">Tất cả trạng thái</option>
            <option value="true">
              {section === 'reviews' ? 'Đang hiển thị' : 'Đang hoạt động'}
            </option>
            <option value="false">{section === 'reviews' ? 'Đã ẩn' : 'Ngừng hoạt động'}</option>
          </select>
        </div>
        {/* Một bảng dùng cho xe, tài xế, khách và đánh giá; section quyết định từng cột. */}
        {records.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{section === 'cars' ? 'Xe / biển số' : 'Thông tin'}</th>
                  <th>Chi tiết</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {/* Chỉ dựng 8 bản ghi của trang hiện tại, mỗi item tạo một hàng. */}
                {records.slice((page - 1) * 8, page * 8).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="entity-name">
                        {section === 'cars' && <img src={item.image} alt={item.name} />}
                        <div>
                          <strong>{item.name}</strong>
                          <small>
                            {section === 'cars'
                              ? item.plate
                              : section === 'reviews'
                                ? '★'.repeat(item.stars)
                                : item.email || item.phone}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {section === 'cars' ? (
                        <>
                          {item.brand} · {item.type} · {item.seats} chỗ
                          <small>{money(item.price)}/ngày</small>
                        </>
                      ) : section === 'drivers' ? (
                        item.license
                      ) : section === 'customers' ? (
                        item.phone
                      ) : (
                        <>
                          <span className="review-cell">{item.text}</span>
                          <small>{data.cars.find((c) => c.id === item.carId)?.name}</small>
                        </>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${(section === 'reviews' ? item.visible : item.active) ? 'confirmed' : 'cancelled'}`}
                      >
                        {(section === 'reviews' ? item.visible : item.active)
                          ? 'Đang hoạt động'
                          : 'Đã ẩn / khóa'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        {['cars', 'drivers'].includes(section) && (
                          <Button variant="outline small" onClick={() => setEditing(item)}>
                            Sửa
                          </Button>
                        )}
                        {section === 'customers' && (
                          <Button variant="outline small" onClick={() => setHistory(item)}>
                            Lịch sử
                          </Button>
                        )}
                        <Button variant="ghost small" onClick={() => toggle(item)}>
                          {(section === 'reviews' ? item.visible : item.active)
                            ? section === 'customers'
                              ? 'Khóa'
                              : 'Ẩn'
                            : 'Kích hoạt'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Không có dữ liệu phù hợp" />
        )}
        <Pagination count={records.length} page={page} setPage={setPage} />
      </div>
      {/* editing có id là sửa; đối tượng rỗng là thêm mới xe hoặc tài xế. */}
      {editing && (
        <Modal
          title={`${editing.id ? 'Chỉnh sửa' : 'Thêm'} ${section === 'cars' ? 'xe' : 'tài xế'}`}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save}>
            <div className="form-grid">
              {/* Cấu hình fields trong hook quyết định nhãn và loại ô nhập cho từng trường. */}
              {fields.map(([key, label, type]) => (
                <Field key={key} label={label}>
                  {Array.isArray(type) ? (
                    <select name={key} defaultValue={editing[key] || type[0]}>
                      {type.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  ) : type === 'textarea' ? (
                    <textarea
                      name={key}
                      rows={3}
                      defaultValue={(editing.gallery || []).join('\n')}
                      placeholder="https://…"
                    />
                  ) : (
                    <input
                      name={key}
                      type={type}
                      defaultValue={editing[key] ?? (key === 'location' ? 'Quy Nhơn' : '')}
                      required
                      min={key === 'seats' ? 2 : key === 'price' ? 1000 : undefined}
                      max={key === 'seats' ? 45 : undefined}
                      maxLength={key === 'image' ? 1000 : 150}
                      pattern={key === 'phone' ? '0[0-9]{9}' : undefined}
                    />
                  )}
                </Field>
              ))}
            </div>
            {section === 'cars' && (
              <div className="actions">
                {[
                  ['self', 'Tự lái'],
                  ['driver', 'Có tài xế'],
                ].map(([key, label]) => (
                  <label key={key} className="checkbox">
                    <input
                      type="checkbox"
                      name={`mode-${key}`}
                      defaultChecked={!editing.modes || editing.modes.includes(key)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}
            <Button className="full">Lưu thông tin</Button>
          </form>
        </Modal>
      )}
      {/* Hiển thị những đơn thuộc khách đang được chọn xem lịch sử. */}
      {history && (
        <Modal title={`Lịch sử · ${history.name}`} onClose={() => setHistory(null)}>
          {historyBookings.length ? (
            historyBookings.map((b) => (
              <div key={b.id} className="summary-row">
                <div>
                  <strong>{b.carName}</strong>
                  <small>
                    {b.id} · {shortDate(b.start)}
                  </small>
                </div>
                <Badge status={b.status} />
              </div>
            ))
          ) : (
            <Empty title="Khách hàng chưa có đơn thuê" />
          )}
        </Modal>
      )}
      {/* Ẩn/khóa/kích hoạt cần xác nhận; confirmToggle mới gửi PATCH lên backend. */}
      {confirmation && (
        <Confirm
          title="Cập nhật trạng thái?"
          text="Thay đổi sẽ áp dụng cho dữ liệu mẫu. Xe đã ẩn không nhận đơn mới; đơn hiện tại vẫn được giữ."
          onClose={() => setConfirmation(null)}
          onConfirm={confirmToggle}
        />
      )}
    </>
  );
}
