import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dichVuApi } from "../../api/dichVu";
import Icon from "../../components/common/Icon";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { DichVuQuanTriRequest } from "../../types";
import { getErrorMessage } from "../../utils/error";
import { formatPrice } from "../../utils/format";

const INITIAL_FORM: DichVuQuanTriRequest = {
  tenDichVu: "",
  gia: 239_000,
  thoiGianDichVu: 30,
  luotDay: 30,
  luotDang: 100,
};
const DURATIONS = [7, 14, 30, 60, 90, 180];

export default function AdminServiceCreate() {
  useDocumentTitle("Thêm gói dịch vụ");
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<DichVuQuanTriRequest>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  // Tất cả input gửi lên đều thuộc TaoDichVuRequest; phần xem trước chỉ phản ánh các giá trị đang nhập.
  const update = <K extends keyof DichVuQuanTriRequest,>(key: K, value: DichVuQuanTriRequest[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  // API tạo gói hiện tự đặt trạng thái HoatDong, vì vậy màn hình thông báo rõ gói sẽ được bán ngay.
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.tenDichVu.trim()) {
      toast("Vui lòng nhập tên gói dịch vụ.", "error");
      return;
    }
    setSaving(true);
    try {
      await dichVuApi.taoQuanTri({ ...form, tenDichVu: form.tenDichVu.trim() });
      toast("Đã tạo gói dịch vụ mới.", "ok");
      navigate("/quan-tri/dich-vu");
    } catch (error) {
      toast(getErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-service-create-page">
      <div className="admin-service-create-breadcrumb">
        <Link to="/quan-tri">Quản trị</Link><span>/</span><Link to="/quan-tri/dich-vu">Gói dịch vụ</Link><span>/</span><strong>Thêm mới</strong>
      </div>
      <header className="admin-service-create-heading">
        <span className="admin-service-create-heading-icon"><Icon name="plus" size={18} /></span>
        <div><span className="admin-service-kicker">QUẢN LÝ GÓI DỊCH VỤ</span><h1 className="admin-page-title">Thêm mới gói dịch vụ</h1><p>Thiết lập quyền lợi, thời hạn và giá bán cho gói dịch vụ mới.</p></div>
        <Link className="admin-service-create-back" to="/quan-tri/dich-vu"><Icon name="left" size={15} /> Quay lại</Link>
      </header>

      <div className="admin-service-create-layout">
        <form className="admin-service-create-form" onSubmit={(event) => void submit(event)}>
          <section className="admin-service-create-section">
            <div className="admin-service-create-section-title"><span className="step-number step-orange">1</span><div><h2>Thông tin cơ bản & định danh</h2><p>Nhập tên hiển thị cho gói dịch vụ trên hệ thống.</p></div><span className="required-hint">Bắt buộc</span></div>
            <label className="field admin-service-create-field"><span>Tên gói dịch vụ</span><input autoFocus required maxLength={255} value={form.tenDichVu} onChange={(event) => update("tenDichVu", event.target.value)} placeholder="Ví dụ: Gói Siêu Nổi Bật" /><small>Tên gói sẽ xuất hiện trên trang dịch vụ của người bán.</small></label>
          </section>

          <section className="admin-service-create-section">
            <div className="admin-service-create-section-title"><span className="step-number step-green">2</span><div><h2>Quyền lợi & giới hạn sử dụng</h2><p>Cấu hình số lượt đăng tin và đẩy tin kèm theo gói.</p></div><span className="admin-service-create-active-tag"><i /> Gói có quyền lợi</span></div>
            <div className="admin-service-create-quota-grid">
              <label className="field admin-service-create-field"><span><Icon name="image" size={15} /> Lượt đăng tin</span><div className="admin-service-number-input"><input type="number" min="0" step="1" required value={form.luotDang} onWheel={(event) => event.currentTarget.blur()} onChange={(event) => update("luotDang", Number(event.target.value))} placeholder="Ví dụ: 100" /><small>lượt</small></div><small>Nhập số lượt đăng, ví dụ: 100.</small></label>
              <label className="field admin-service-create-field"><span><Icon name="check" size={15} /> Lượt đẩy tin</span><div className="admin-service-number-input"><input type="number" min="0" step="1" required value={form.luotDay} onWheel={(event) => event.currentTarget.blur()} onChange={(event) => update("luotDay", Number(event.target.value))} placeholder="Ví dụ: 30" /><small>lượt</small></div><small>Nhập số lượt đẩy, ví dụ: 30.</small></label>
            </div>
          </section>

          <section className="admin-service-create-section">
            <div className="admin-service-create-section-title"><span className="step-number step-yellow">3</span><div><h2>Thiết lập thời hạn & giá bán</h2><p>Giá và thời hạn được lưu trực tiếp vào dữ liệu gói dịch vụ.</p></div></div>
            <div className="admin-service-create-field">
              <span className="admin-service-create-label">Thời hạn gói</span>
              <div className="admin-service-duration-options">{DURATIONS.map((days) => <button type="button" key={days} className={form.thoiGianDichVu === days ? "is-selected" : ""} aria-pressed={form.thoiGianDichVu === days} onClick={() => update("thoiGianDichVu", days)}>{days} ngày</button>)}</div>
              <label className="admin-service-custom-duration">Hoặc nhập số ngày <input aria-label="Thời hạn tùy chỉnh (ngày)" type="number" min="1" step="1" required value={form.thoiGianDichVu} onChange={(event) => update("thoiGianDichVu", Number(event.target.value))} /></label>
            </div>
            <div className="admin-service-create-price-grid">
              <label className="field admin-service-create-field"><span>Giá bán (VNĐ)</span><div className="admin-service-number-input"><input type="number" min="0" step="1000" required value={form.gia} onWheel={(event) => event.currentTarget.blur()} onChange={(event) => update("gia", Number(event.target.value))} placeholder="Ví dụ: 100000" /><small>₫</small></div><small>Nhập giá bằng số, ví dụ: 100000.</small></label>
              <div className="admin-service-create-price-hint"><Icon name="shield" size={16} /><span><b>Giá hiển thị cho khách</b><small>{formatPrice(form.gia)} / {form.thoiGianDichVu} ngày</small></span></div>
            </div>
          </section>

          <section className="admin-service-create-section admin-service-create-status-section">
            <div className="admin-service-create-section-title"><span className="step-number step-gray">4</span><div><h2>Trạng thái & điều kiện bán</h2><p>Gói mới sẽ được tạo ở trạng thái hoạt động theo API hiện tại.</p></div></div>
            <div className="admin-service-create-status-row"><span className="admin-service-status is-active"><i /> Hoạt động</span><span>Người bán có thể mua gói ngay sau khi lưu.</span></div>
          </section>

          <div className="admin-service-create-actions"><Link className="btn btn-ghost" to="/quan-tri/dich-vu">Hủy</Link><button type="submit" className="btn" disabled={saving}><Icon name="check" size={16} />{saving ? "Đang tạo gói…" : "Tạo gói dịch vụ"}</button></div>
        </form>

        <aside className="admin-service-create-aside">
          <section className="admin-service-preview-panel">
            <div className="admin-service-preview-heading"><div><span className="admin-service-kicker">XEM TRƯỚC</span><h2>Gói dịch vụ trên website</h2></div><span className="admin-service-preview-web">Web card</span></div>
            <article className="admin-service-preview-card">
              <span className="admin-service-preview-ribbon">GÓI DỊCH VỤ</span>
              <span className="admin-service-preview-icon"><Icon name="tag" size={20} /></span>
              <small>GÓI DỊCH VỤ NGƯỜI BÁN</small>
              <h3>{form.tenDichVu.trim() || "Tên gói dịch vụ"}</h3>
              <strong>{formatPrice(form.gia)}<small> / {form.thoiGianDichVu} ngày</small></strong>
              <ul><li><Icon name="check" size={14} /> {form.luotDang} lượt đăng tin</li><li><Icon name="check" size={14} /> {form.luotDay} lượt đẩy tin</li></ul>
              <button type="button" disabled>Mua gói dịch vụ</button>
              <small className="admin-service-preview-note">Bản xem trước được dựng từ các trường sẽ gửi đến backend.</small>
            </article>
          </section>

          <section className="admin-service-check-panel">
            <div className="admin-service-check-heading"><Icon name="check" size={16} /><div><h2>Kiểm tra thông tin gói</h2><p>Điều kiện gửi theo API hiện tại</p></div></div>
            <ul>
              <li><span><i className={form.tenDichVu.trim() ? "is-valid" : ""} />Tên gói hợp lệ</span><b>{form.tenDichVu.trim() ? "Đạt" : "Cần nhập"}</b></li>
              <li><span><i className={form.gia >= 0 ? "is-valid" : ""} />Giá không âm</span><b>{form.gia >= 0 ? "Đạt" : "Không hợp lệ"}</b></li>
              <li><span><i className={form.thoiGianDichVu > 0 ? "is-valid" : ""} />Thời hạn lớn hơn 0</span><b>{form.thoiGianDichVu > 0 ? "Đạt" : "Không hợp lệ"}</b></li>
              <li><span><i className={form.luotDang >= 0 && form.luotDay >= 0 ? "is-valid" : ""} />Lượt dùng không âm</span><b>{form.luotDang >= 0 && form.luotDay >= 0 ? "Đạt" : "Không hợp lệ"}</b></li>
            </ul>
          </section>
          <p className="admin-service-create-api-note">Dữ liệu gói được lưu qua <code>POST /api/dich-vu</code>. Trang này không dùng dữ liệu giả.</p>
        </aside>
      </div>
    </div>
  );
}
