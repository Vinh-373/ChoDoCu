import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { baiDangApi } from "../../api/baiDang";
import { danhMucApi } from "../../api/danhMuc";
import CategorySelect from "../../components/common/CategorySelect";
import Icon from "../../components/common/Icon";
import LocationFields from "../../components/common/LocationFields";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/error";
import { imgSrc, onImgError } from "../../utils/image";

const MAX_IMAGES = 10;

export default function PostCreate() {
  useDocumentTitle("Đăng tin");
  const navigate = useNavigate();
  const toast = useToast();
  const tree = useFetch(() => danhMucApi.cay(), []);

  const [tieuDe, setTieuDe] = useState("");
  const [tenSanPham, setTenSanPham] = useState("");
  const [giaTien, setGiaTien] = useState("");
  const [idDanhMuc, setIdDanhMuc] = useState<number | undefined>();
  const [idThanhPho, setIdThanhPho] = useState<number | undefined>();
  const [idPhuongXa, setIdPhuongXa] = useState<number | undefined>();
  const [diaChi, setDiaChi] = useState("");
  const [diaChiTuSua, setDiaChiTuSua] = useState(false);
  const [diaChiChiTiet, setDiaChiChiTiet] = useState("");
  const [noiDung, setNoiDung] = useState("");
  const [moTa, setMoTa] = useState("");
  const [urls, setUrls] = useState<string[]>([""]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onLocation = (v: { idThanhPho?: number; idPhuongXa?: number; tenThanhPho?: string; tenPhuongXa?: string }) => {
    setIdThanhPho(v.idThanhPho);
    setIdPhuongXa(v.idPhuongXa);
    // Tự điền "Khu vực" từ lựa chọn, trừ khi người dùng đã tự gõ.
    if (!diaChiTuSua) setDiaChi([v.tenPhuongXa, v.tenThanhPho].filter(Boolean).join(", "));
  };

  const setUrl = (i: number, value: string) => setUrls((cur) => cur.map((u, idx) => (idx === i ? value : u)));
  const removeUrl = (i: number) => setUrls((cur) => (cur.length === 1 ? [""] : cur.filter((_, idx) => idx !== i)));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const urlAnhs = urls.map((u) => u.trim()).filter(Boolean);
    const gia = Number(giaTien);
    if (!idDanhMuc) return setError("Hãy chọn danh mục.");
    if (!idThanhPho) return setError("Hãy chọn thành phố.");
    if (!Number.isFinite(gia) || gia < 0) return setError("Giá không hợp lệ.");
    if (urlAnhs.length < 1 || urlAnhs.length > MAX_IMAGES) return setError(`Mỗi tin cần từ 1 đến ${MAX_IMAGES} ảnh.`);

    setBusy(true);
    try {
      const created = await baiDangApi.tao({
        tieuDe: tieuDe.trim(),
        noiDung: noiDung.trim(),
        tenSanPham: tenSanPham.trim(),
        giaTien: gia,
        moTa: moTa.trim() || noiDung.trim(),
        idDanhMuc,
        idThanhPho,
        idPhuongXa: idPhuongXa ?? null,
        diaChi: diaChi.trim(),
        diaChiChiTiet: diaChiChiTiet.trim(),
        urlAnhs: urlAnhs,
      });
      toast("Đã gửi tin. Tin sẽ hiện sau khi quản trị viên duyệt.", "ok");
      navigate(`/bai-dang/${created.id}`);
    } catch (err) {
      setError(getErrorMessage(err, "Chưa đăng được tin."));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Đăng tin bán đồ</h1>
      </div>
      <form className="stack" onSubmit={submit} style={{ maxWidth: 820 }}>
        {error && <div className="alert" role="alert">{error}</div>}

        <section className="panel stack">
          <h2 style={{ fontSize: "1.15rem" }}>Món đồ</h2>
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="td">Tiêu đề tin</label>
              <input id="td" type="text" required maxLength={255} value={tieuDe} onChange={(e) => setTieuDe(e.target.value)} placeholder="iPhone 12 64GB, pin 89%, còn bảo hành" />
            </div>
            <div className="field">
              <label htmlFor="tsp">Tên sản phẩm</label>
              <input id="tsp" type="text" required maxLength={255} value={tenSanPham} onChange={(e) => setTenSanPham(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="gia">Giá bán (đồng)</label>
              <input id="gia" type="number" required min={0} step={1000} value={giaTien} onChange={(e) => setGiaTien(e.target.value)} />
            </div>
            <div className="field span-2">
              <label htmlFor="dm">Danh mục</label>
              <CategorySelect id="dm" required tree={tree.data ?? []} value={idDanhMuc} onChange={setIdDanhMuc} placeholder="Chọn danh mục" />
            </div>
            <div className="field span-2">
              <label htmlFor="nd">Mô tả chi tiết</label>
              <textarea id="nd" required value={noiDung} onChange={(e) => setNoiDung(e.target.value)} placeholder="Tình trạng, thời gian sử dụng, phụ kiện kèm theo, lý do bán…" />
            </div>
            <div className="field span-2">
              <label htmlFor="mt">Ghi chú thêm về sản phẩm</label>
              <textarea id="mt" style={{ minHeight: 70 }} value={moTa} onChange={(e) => setMoTa(e.target.value)} />
              <span className="hint">Không bắt buộc. Để trống thì dùng luôn phần mô tả ở trên.</span>
            </div>
          </div>
        </section>

        <section className="panel stack">
          <h2 style={{ fontSize: "1.15rem" }}>Nơi bán</h2>
          <div className="form-grid">
            <LocationFields idThanhPho={idThanhPho} idPhuongXa={idPhuongXa} onChange={onLocation} cityPlaceholder="Chọn thành phố" required />
            <div className="field">
              <label htmlFor="dc">Khu vực hiển thị</label>
              <input
                id="dc"
                type="text"
                required
                maxLength={255}
                value={diaChi}
                onChange={(e) => {
                  setDiaChi(e.target.value);
                  setDiaChiTuSua(true);
                }}
                placeholder="Phường Bến Nghé, Hồ Chí Minh"
              />
            </div>
            <div className="field">
              <label htmlFor="dct">Địa chỉ cụ thể</label>
              <input id="dct" type="text" required maxLength={255} value={diaChiChiTiet} onChange={(e) => setDiaChiChiTiet(e.target.value)} placeholder="Số nhà, tên đường" />
            </div>
          </div>
        </section>

        <section className="panel stack">
          <div>
            <h2 style={{ fontSize: "1.15rem" }}>Ảnh sản phẩm</h2>
            <p className="hint">Dán đường dẫn ảnh (tối đa {MAX_IMAGES}). Ảnh đầu tiên là ảnh đại diện. Hệ thống chưa hỗ trợ tải ảnh trực tiếp từ máy.</p>
          </div>
          <div className="img-list">
            {urls.map((u, i) => (
              <div className="img-row" key={i}>
                <img src={imgSrc(u.trim() || null)} alt="" onError={onImgError} />
                <input type="url" aria-label={`Đường dẫn ảnh ${i + 1}`} value={u} onChange={(e) => setUrl(i, e.target.value)} placeholder="https://…/anh.jpg" />
                <button type="button" className="icon-btn" aria-label={`Xoá ảnh ${i + 1}`} onClick={() => removeUrl(i)}>
                  <Icon name="trash" size={18} />
                </button>
              </div>
            ))}
          </div>
          <div>
            <button type="button" className="btn btn-ghost btn-sm" disabled={urls.length >= MAX_IMAGES} onClick={() => setUrls((c) => [...c, ""])}>
              <Icon name="plus" size={16} /> Thêm ảnh
            </button>
          </div>
        </section>

        <div className="row">
          <button className="btn" disabled={busy}>
            {busy ? "Đang gửi…" : "Đăng tin"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            Huỷ
          </button>
        </div>
      </form>
    </>
  );
}
