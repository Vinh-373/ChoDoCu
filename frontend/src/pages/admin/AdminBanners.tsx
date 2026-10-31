import { useMemo, useState, type FormEvent } from "react";
import { bannerApi } from "../../api/banner";
import Icon from "../../components/common/Icon";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/error";
import { imgSrc } from "../../utils/image";

/** Trang quản trị banner: dữ liệu danh sách và thao tác tạo/xóa lấy trực tiếp từ API banner. */
export default function AdminBanners() {
  useDocumentTitle("Quản lý Banner");
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => bannerApi.danhSach(), []);
  const [url, setUrl] = useState("");
  const [pos, setPos] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Chọn banner có thật từ thư viện để làm ảnh nền preview; nếu đang nhập URL mới thì xem thử URL nháp.
  const selectedBanner = useMemo(
    () => data?.find((banner) => banner.id === selectedId) ?? data?.[0] ?? null,
    [data, selectedId],
  );
  const previewImage = url.trim() || selectedBanner?.hinhAnh || null;

  // API hiện chỉ hỗ trợ tạo banner với URL ảnh và vị trí; các thao tác trạng thái/lịch chạy không có endpoint.
  const add = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      await bannerApi.tao({ hinhAnh: url.trim(), viTri: pos.trim() || null });
      toast("Đã thêm banner.", "ok");
      setUrl("");
      setPos("");
      reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  // Xóa dùng API thật và xác nhận trước khi thực hiện; sau đó tải lại thư viện để đồng bộ giao diện.
  const remove = async (id: number) => {
    if (!window.confirm("Xóa banner này khỏi danh sách?")) return;
    try {
      await bannerApi.xoa(id);
      toast("Đã xóa banner.", "ok");
      if (selectedId === id) setSelectedId(null);
      reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  // Điều hướng đến các khối thao tác trong cùng trang để các nút đầu trang có hành động hữu ích.
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="stack admin-banner-page">
      <div className="admin-banner-heading">
        <div>
          <div className="admin-banner-kicker">MARKETING &amp; HIỂN THỊ <span>•</span> Banner đang quản lý</div>
          <h1 className="admin-page-title">Quản lý banner chạy</h1>
          <p className="admin-banner-subtitle">Theo dõi ảnh banner trên sàn và quản lý danh sách hình ảnh hiển thị.</p>
        </div>
        <div className="admin-banner-heading-actions">
          <button type="button" className="btn btn-secondary" onClick={() => scrollTo("admin-banner-preview")}><Icon name="image" size={16} /> Xem trước</button>
          <button type="button" className="btn" onClick={() => scrollTo("admin-banner-form")}><Icon name="plus" size={16} /> Thêm banner mới</button>
        </div>
      </div>

      {/* Preview dùng ảnh thật đã chọn hoặc URL đang nhập. Nội dung quảng bá phủ trên ảnh chỉ là bản minh họa vì API không có trường nội dung. */}
      <section id="admin-banner-preview" className="panel admin-banner-preview-panel">
        <div className="admin-banner-section-heading">
          <h2><Icon name="image" size={17} /> Banner đang hiển thị trực tiếp <span>(Live Preview)</span></h2>
          <span className="admin-banner-muted">Ảnh lấy từ banner đã chọn</span>
        </div>
        <div className="admin-banner-live-preview" style={previewImage ? { backgroundImage: `linear-gradient(90deg, rgba(39,24,13,.82), rgba(39,24,13,.15)), url("${previewImage.replaceAll('"', "%22")}")` } : undefined}>
          <div className="admin-banner-live-copy">
            <span className="admin-banner-live-tag">NỘI DUNG MINH HỌA</span>
            <h2>Đưa sản phẩm nổi bật đến gần khách hàng hơn</h2>
            <p>Tiêu đề, mô tả và nút kêu gọi trong khung này là nội dung mẫu; backend hiện chỉ lưu URL ảnh và vị trí banner.</p>
            <span className="admin-banner-live-cta">Khám phá ngay <Icon name="right" size={14} /></span>
          </div>
          {!previewImage && <div className="admin-banner-no-image"><Icon name="image" size={25} />Chưa có ảnh banner để xem trước</div>}
          <span className="admin-banner-preview-position">Vị trí: {url.trim() ? (pos.trim() || "chưa đặt") : (selectedBanner?.viTri || "chưa xác định")}</span>
        </div>
        <div className="admin-banner-preview-note"><Icon name="info" size={14} /> Ảnh preview là dữ liệu thật nếu đã có banner; nội dung chữ phủ lên ảnh là minh họa, cần mở rộng API/DTO nếu muốn lưu nội dung quảng cáo.</div>
      </section>

      {/* Thẻ số lượng được tính từ API. Lượt hiển thị và CTR không có API nên chỉ minh họa, không dùng làm số liệu vận hành. */}
      <section className="admin-banner-stats" aria-label="Tổng quan banner">
        <article className="admin-banner-stat"><span>Tổng banner</span><strong>{data?.length ?? 0}</strong><small>Danh sách hiện có trên hệ thống</small><i><Icon name="image" size={18} /></i></article>
        <article className="admin-banner-stat"><span>Vị trí đã cấu hình</span><strong>{new Set((data ?? []).map((banner) => banner.viTri).filter(Boolean)).size}</strong><small>Tính từ trường vị trí trong API</small><i><Icon name="grid" size={18} /></i></article>
        <article className="admin-banner-stat admin-banner-stat-mock"><span>Lượt hiển thị <b>Minh họa</b></span><strong>125.400</strong><small>Chưa có API thống kê impression</small><i><Icon name="image" size={18} /></i></article>
        <article className="admin-banner-stat admin-banner-stat-mock"><span>Tỷ lệ nhấp (CTR) <b>Minh họa</b></span><strong>8,2%</strong><small>Chưa có API thống kê click</small><i><Icon name="info" size={18} /></i></article>
      </section>
      <p className="admin-banner-data-note"><Icon name="info" size={14} /> Hai chỉ số lượt hiển thị và CTR phía trên là dữ liệu minh họa; cần bổ sung API tracking lượt xem và lượt nhấp để hiển thị số liệu thật.</p>

      <div className="admin-banner-workspace">
        {/* Form chỉ gửi đúng hai trường mà endpoint POST /banner đang nhận. */}
        <section id="admin-banner-form" className="panel admin-banner-config">
          <div className="admin-banner-section-heading">
            <h2><Icon name="image" size={17} /> Cấu hình &amp; thêm banner mới</h2>
            <span className="admin-banner-muted">Dữ liệu được lưu qua API</span>
          </div>
          <form onSubmit={add}>
            <label className="admin-banner-upload" htmlFor="admin-banner-url">
              {url.trim() ? <img src={imgSrc(url)} alt="Xem thử ảnh banner mới" /> : <span className="admin-banner-upload-icon"><Icon name="image" size={24} /></span>}
              <strong>{url.trim() ? "Đã nhập URL ảnh" : "Thêm ảnh banner bằng đường dẫn"}</strong>
              <span>Nhập URL ảnh công khai để hệ thống hiển thị banner.</span>
              <em>API hiện nhận URL ảnh, chưa hỗ trợ tải tệp trực tiếp</em>
            </label>
            <div className="admin-banner-field">
              <label htmlFor="admin-banner-url">Đường dẫn ảnh <b>*</b></label>
              <input id="admin-banner-url" type="url" required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Ví dụ: https://example.com/banner.jpg" />
            </div>
            <div className="admin-banner-field">
              <label htmlFor="admin-banner-position">Vị trí hiển thị</label>
              <input id="admin-banner-position" value={pos} onChange={(event) => setPos(event.target.value)} placeholder="Ví dụ: TrangChu" />
            </div>
            <div className="admin-banner-form-note"><Icon name="info" size={14} /> API chưa có trường lịch chạy, liên kết đích, trạng thái bật/tắt hoặc tiêu đề banner.</div>
            <button className="btn admin-banner-submit" disabled={busy}><Icon name="plus" size={16} /> {busy ? "Đang thêm banner..." : "Thêm banner vào danh sách"}</button>
          </form>
        </section>

        {/* Thư viện hiển thị các banner thật. Chọn một hàng để xem ảnh ở preview; nút xóa gọi API DELETE. */}
        <section className="panel admin-banner-library">
          <div className="admin-banner-section-heading">
            <h2><Icon name="grid" size={17} /> Thư viện banner</h2>
            <span className="admin-banner-muted">{data?.length ?? 0} banner</span>
          </div>
          {loading && !data ? <Spinner /> : error ? <ErrorBox message={error} onRetry={reload} /> : !data?.length ? <Empty title="Chưa có banner"><span>Thêm một URL ảnh để bắt đầu tạo thư viện banner.</span></Empty> : (
            <div className="admin-banner-list">
              {data.map((banner) => (
                <article className={`admin-banner-item ${selectedBanner?.id === banner.id ? "is-selected" : ""}`} key={banner.id}>
                  <button className="admin-banner-item-select" type="button" onClick={() => setSelectedId(banner.id)} aria-label={`Xem trước banner ${banner.id}`}>
                    <img src={imgSrc(banner.hinhAnh)} alt="" />
                    <span className="admin-banner-item-copy"><strong>{banner.viTri || "Chưa gán vị trí"}</strong><small>{banner.ngaySua ? new Date(banner.ngaySua).toLocaleDateString("vi-VN") : `Banner #${banner.id}`}</small></span>
                  </button>
                  <span className="admin-banner-item-real">API</span>
                  <button className="icon-btn admin-banner-delete" type="button" aria-label={`Xóa banner ${banner.id}`} onClick={() => void remove(banner.id)}><Icon name="trash" size={16} /></button>
                </article>
              ))}
            </div>
          )}
          <div className="admin-banner-library-note"><Icon name="info" size={14} /> Backend hiện có API danh sách, thêm và xóa banner; chưa hỗ trợ sửa banner.</div>
        </section>
      </div>
    </div>
  );
}
