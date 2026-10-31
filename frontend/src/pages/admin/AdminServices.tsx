import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { dichVuApi } from "../../api/dichVu";
import Icon from "../../components/common/Icon";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import Pagination from "../../components/common/Pagination";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { formatDate, formatPrice } from "../../utils/format";
import { getErrorMessage } from "../../utils/error";
import type { DichVuQuanTri, DichVuQuanTriRequest } from "../../types";

const PAGE_SIZE = 8;
const EMPTY_FORM: DichVuQuanTriRequest = { tenDichVu: "", gia: 0, thoiGianDichVu: 30, luotDay: 0, luotDang: 0 };

// DỮ LIỆU MINH HỌA: backend chưa có API doanh thu/lượt mua tổng hợp cho quản trị viên.
// Cần endpoint thống kê theo tháng, trả về doanh thu, số đơn, số người mua và trạng thái thanh toán.
const SAMPLE_MONTHS = [
  { month: "Tháng 10/2026", revenue: 148_500_000, orders: 960, buyers: 412, change: "+4.2%", fill: 86 },
  { month: "Tháng 9/2026", revenue: 142_500_000, orders: 940, buyers: 398, change: "+1.8%", fill: 78 },
  { month: "Tháng 8/2026", revenue: 156_200_000, orders: 1_050, buyers: 430, change: "+8.5%", fill: 100 },
  { month: "Tháng 7/2026", revenue: 132_000_000, orders: 880, buyers: 375, change: "−4.5%", fill: 68 },
];

const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

export default function AdminServices() {
  useDocumentTitle("Quản lý gói dịch vụ");
  const navigate = useNavigate();
  const toast = useToast();
  // Endpoint admin trả về cả gói đang hoạt động lẫn đã ngừng bán, khác API public chỉ trả gói hoạt động.
  const { data, loading, error, reload } = useFetch(() => dichVuApi.danhSachQuanTri(), []);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DichVuQuanTri | null>(null);
  const [form, setForm] = useState<DichVuQuanTriRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Tìm kiếm/lọc trên danh sách thật đã tải từ GET /api/dich-vu/quan-tri.
  const filtered = useMemo(() => {
    const q = keyword.trim().toLocaleLowerCase("vi");
    return (data ?? []).filter((item) => {
      const matchesKeyword = !q || item.tenDichVu.toLocaleLowerCase("vi").includes(q) || String(item.id).includes(q);
      const matchesStatus = statusFilter === "all" || item.trangThai === statusFilter;
      const matchesDuration = durationFilter === "all" || item.thoiGianDichVu <= Number(durationFilter);
      return matchesKeyword && matchesStatus && matchesDuration;
    });
  }, [data, keyword, statusFilter, durationFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Các KPI có thể tính từ metadata thật của danh sách gói dịch vụ; đây là hạn mức cấu hình,
  // không phải lượt đăng/đẩy đã dùng. Doanh thu và người mua được ghi nhãn minh họa bên dưới.
  const activeCount = (data ?? []).filter((item) => item.trangThai === "HoatDong").length;
  const inactiveCount = (data ?? []).length - activeCount;
  const totalPostingQuota = (data ?? []).reduce((sum, item) => sum + item.luotDang, 0);
  const liveValue = (value: number) => loading ? "…" : error ? "—" : formatNumber(value);

  const openCreate = () => navigate("/quan-tri/dich-vu/them");
  const openEdit = (item: DichVuQuanTri) => {
    setEditing(item);
    setForm({ tenDichVu: item.tenDichVu, gia: item.gia, thoiGianDichVu: item.thoiGianDichVu, luotDay: item.luotDay, luotDang: item.luotDang });
    setModalOpen(true);
  };

  // Hộp thoại này chỉ chỉnh sửa gói; tạo gói có màn hình riêng theo thiết kế mới.
  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await dichVuApi.capNhatQuanTri(editing.id, form);
      toast("Đã cập nhật gói dịch vụ.", "ok");
      setEditing(null);
      setModalOpen(false);
      reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  // DELETE hiện được backend dùng để chuyển trạng thái sang NgungHoatDong (không xóa vật lý).
  // Endpoint PUT /{id}/kich-hoat được bổ sung để có thể khôi phục gói đã ngừng bán.
  const toggleStatus = async (item: DichVuQuanTri) => {
    const isActive = item.trangThai === "HoatDong";
    const action = isActive ? "ngừng bán" : "kích hoạt lại";
    if (!window.confirm(`Bạn có chắc muốn ${action} gói “${item.tenDichVu}”?`)) return;
    setBusyId(item.id);
    try {
      if (isActive) await dichVuApi.ngungBan(item.id);
      else await dichVuApi.kichHoat(item.id);
      toast(isActive ? "Đã ngừng bán gói dịch vụ." : "Đã kích hoạt gói dịch vụ.", "ok");
      reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-service-page">
      <header className="admin-service-heading">
        <div>
          <span className="admin-service-kicker">QUẢN TRỊ HỆ THỐNG · GÓI DỊCH VỤ</span>
          <h1 className="admin-page-title">Quản lý gói dịch vụ</h1>
          <p>Quản lý các gói đăng tin và quyền lợi người bán trên Chợ Đồ Cũ.</p>
        </div>
        <button type="button" className="btn" onClick={openCreate}><Icon name="plus" size={17} /> Tạo gói dịch vụ</button>
      </header>

      <section className="admin-service-kpis" aria-label="Tổng quan gói dịch vụ">
        <article className="admin-service-kpi"><span>Tổng số gói</span><strong>{liveValue(data?.length ?? 0)}</strong><small>Từ danh sách quản trị</small><i className="orange"><Icon name="tag" size={16} /></i></article>
        <article className="admin-service-kpi"><span>Đang kinh doanh</span><strong>{liveValue(activeCount)}</strong><small>Trạng thái HoatDong</small><i className="green"><Icon name="check" size={16} /></i></article>
        <article className="admin-service-kpi"><span>Doanh thu tháng này</span><strong className="admin-service-demo-value">142.500.000 đ</strong><small><b className="admin-service-demo-label">Dữ liệu minh họa</b></small><i className="yellow">₫</i></article>
        <article className="admin-service-kpi"><span>Lượt mua trong tháng</span><strong className="admin-service-demo-value">1.290</strong><small><b className="admin-service-demo-label">Dữ liệu minh họa</b></small><i className="purple">♙</i></article>
      </section>

      <section className="admin-service-panel">
        <div className="admin-service-toolbar">
          <label className="admin-service-search"><Icon name="search" size={17} /><input aria-label="Tìm gói dịch vụ" placeholder="Tìm tên gói hoặc mã gói..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} /></label>
          <label className="admin-service-filter"><span className="sr-only">Lọc trạng thái</span><select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}><option value="all">Mọi trạng thái</option><option value="HoatDong">Đang hoạt động</option><option value="NgungHoatDong">Ngừng hoạt động</option></select></label>
          <label className="admin-service-filter"><span className="sr-only">Lọc thời hạn</span><select value={durationFilter} onChange={(e) => { setDurationFilter(e.target.value); setPage(1); }}><option value="all">Mọi thời hạn</option><option value="30">Tối đa 30 ngày</option><option value="90">Tối đa 90 ngày</option><option value="365">Tối đa 365 ngày</option></select></label>
          <button type="button" className="btn btn-ghost btn-sm" onClick={reload}><Icon name="left" size={15} /> Làm mới</button>
        </div>

        {loading && !data ? <Spinner label="Đang tải danh sách gói dịch vụ…" /> : error ? <ErrorBox message={error} onRetry={reload} /> : !data || data.length === 0 ? (
          <Empty title="Chưa có gói dịch vụ" ><button type="button" className="btn btn-sm" onClick={openCreate}>Tạo gói đầu tiên</button></Empty>
        ) : filtered.length === 0 ? <Empty title="Không tìm thấy gói phù hợp" /> : (
          <>
            <div className="admin-service-table-wrap">
              <table className="admin-service-table">
                <thead><tr><th><input type="checkbox" aria-label="Chọn tất cả gói trên trang" disabled /></th><th>TÊN GÓI DỊCH VỤ</th><th>GIÁ GÓI</th><th>THỜI HẠN</th><th>LƯỢT ĐĂNG</th><th>LƯỢT ĐẨY</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th>THAO TÁC</th></tr></thead>
                <tbody>{visibleItems.map((item) => {
                  const isActive = item.trangThai === "HoatDong";
                  return <tr key={item.id}>
                    <td><input type="checkbox" aria-label={`Chọn gói ${item.tenDichVu}`} disabled /></td>
                    <td><div className="admin-service-name"><span className={`admin-service-plan-icon plan-${item.id % 4}`}><Icon name="tag" size={15} /></span><span><strong>{item.tenDichVu}</strong><small>Mã gói #{item.id}</small></span></div></td>
                    <td><strong className="admin-service-price">{formatPrice(item.gia)}</strong></td>
                    <td>{item.thoiGianDichVu} ngày</td>
                    <td><span className="admin-service-quota">{formatNumber(item.luotDang)} lượt</span></td>
                    <td><span className="admin-service-quota">{formatNumber(item.luotDay)} lượt</span></td>
                    <td><span className={`admin-service-status ${isActive ? "is-active" : "is-inactive"}`}><i />{isActive ? "Đang bán" : "Ngừng bán"}</span></td>
                    <td>{formatDate(item.ngayTao)}</td>
                    <td><div className="admin-service-row-actions">
                      <button type="button" className="admin-service-icon-button" aria-label={`Sửa ${item.tenDichVu}`} title="Sửa gói" onClick={() => openEdit(item)}><Icon name="edit" size={16} /></button>
                      <button type="button" role="switch" aria-checked={isActive} aria-label={`${isActive ? "Ngừng bán" : "Kích hoạt"} ${item.tenDichVu}`} title={isActive ? "Ngừng bán" : "Kích hoạt lại"} className={`admin-service-switch ${isActive ? "is-on" : ""}`} disabled={busyId === item.id} onClick={() => void toggleStatus(item)}><span /></button>
                    </div></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
            <div className="admin-service-table-footer"><span>Hiển thị {visibleItems.length} / {filtered.length} gói · {inactiveCount} gói đang ngừng bán · Tổng hạn mức đăng: {formatNumber(totalPostingQuota)}</span><Pagination page={page} totalPages={pageCount} onChange={setPage} /></div>
          </>
        )}
      </section>

      <section className="admin-service-panel admin-service-revenue">
        <div className="admin-service-section-heading"><div><span className="admin-service-kicker">THỐNG KÊ GÓI DỊCH VỤ</span><h2>Doanh thu & lượt mua theo tháng</h2><p>Dữ liệu minh họa — backend chưa có API tổng hợp giao dịch dành cho admin.</p></div><span className="admin-service-demo-pill">DỮ LIỆU MINH HỌA</span></div>
        <div className="admin-service-revenue-summary">
          <div><small>Doanh thu tháng gần nhất</small><strong>142.500.000 đ</strong><em>+4,2% · minh họa</em></div>
          <div><small>Lượt mua trong tháng</small><strong>1.290</strong><em>+8,4% · minh họa</em></div>
          <div><small>Gói đang kinh doanh</small><strong>{liveValue(activeCount)}</strong><em>Dữ liệu thật từ API danh sách</em></div>
        </div>
        <div className="admin-service-month-list">{SAMPLE_MONTHS.map((month) => <div className="admin-service-month" key={month.month}><span>{month.month}</span><strong>{formatPrice(month.revenue)}</strong><span>{formatNumber(month.orders)} đơn · {formatNumber(month.buyers)} người mua</span><span className={month.change.startsWith("+") ? "positive" : "negative"}>{month.change}</span><i><b style={{ width: `${month.fill}%` }} /></i></div>)}</div>
      </section>

      <section className="admin-service-plan-section">
        <div className="admin-service-section-heading"><div><span className="admin-service-kicker">DANH MỤC SẢN PHẨM</span><h2>Các gói dịch vụ hiện có</h2><p>Thông tin dưới đây lấy từ API quản trị, không dùng dữ liệu giả.</p></div></div>
        {data && data.length > 0 && <div className="admin-service-plan-grid">{data.slice(0, 3).map((item) => <article className="admin-service-plan-card" key={item.id}><div className="admin-service-plan-card-top"><span className={`admin-service-status ${item.trangThai === "HoatDong" ? "is-active" : "is-inactive"}`}><i />{item.trangThai === "HoatDong" ? "Đang bán" : "Ngừng bán"}</span><span>#{item.id}</span></div><h3>{item.tenDichVu}</h3><strong>{formatPrice(item.gia)}<small> / {item.thoiGianDichVu} ngày</small></strong><p>{formatNumber(item.luotDang)} lượt đăng · {formatNumber(item.luotDay)} lượt đẩy</p><button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>Chỉnh sửa gói</button></article>)}</div>}
      </section>

      {/* Modal sửa dùng DTO thật; biểu mẫu tạo mới đã chuyển sang route riêng. */}
      {modalOpen && <div className="admin-service-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setModalOpen(false); }}>
        <section className="admin-service-modal" role="dialog" aria-modal="true" aria-labelledby="admin-service-modal-title">
          <div className="admin-service-modal-heading"><div><span className="admin-service-kicker">THÔNG TIN SẢN PHẨM</span><h2 id="admin-service-modal-title">Cập nhật gói dịch vụ</h2></div><button type="button" className="admin-service-icon-button" aria-label="Đóng" onClick={() => setModalOpen(false)} disabled={saving}><Icon name="x" size={18} /></button></div>
          <form onSubmit={(event) => void submitForm(event)} className="admin-service-form">
            <label className="field admin-service-form-wide"><span>Tên gói dịch vụ</span><input required maxLength={255} value={form.tenDichVu} onChange={(e) => setForm({ ...form, tenDichVu: e.target.value })} placeholder="Ví dụ: Gói Siêu Nổi Bật" /></label>
            <label className="field"><span>Giá (VNĐ)</span><input type="number" min="0" step="1000" required value={form.gia} onChange={(e) => setForm({ ...form, gia: Number(e.target.value) })} /></label>
            <label className="field"><span>Thời hạn (ngày)</span><input type="number" min="1" step="1" required value={form.thoiGianDichVu} onChange={(e) => setForm({ ...form, thoiGianDichVu: Number(e.target.value) })} /></label>
            <label className="field"><span>Lượt đăng</span><input type="number" min="0" step="1" required value={form.luotDang} onChange={(e) => setForm({ ...form, luotDang: Number(e.target.value) })} /></label>
            <label className="field"><span>Lượt đẩy</span><input type="number" min="0" step="1" required value={form.luotDay} onChange={(e) => setForm({ ...form, luotDay: Number(e.target.value) })} /></label>
            <div className="admin-service-form-actions"><button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)} disabled={saving}>Hủy</button><button type="submit" className="btn" disabled={saving}>Lưu thay đổi</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}
