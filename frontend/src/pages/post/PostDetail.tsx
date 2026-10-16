import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { baiDangApi } from "../../api/baiDang";
import { baoCaoApi } from "../../api/baoCao";
import { tinNhanApi } from "../../api/tinNhan";
import Icon from "../../components/common/Icon";
import { ErrorBox, Spinner } from "../../components/common/State";
import { useAuth } from "../../contexts/AuthContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/error";
import { formatDate, formatPrice, timeAgo, TRANG_THAI_BAI_DANG } from "../../utils/format";
import { imgSrc, onImgError } from "../../utils/image";

export default function PostDetail() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();
  const { user, isStaff } = useAuth();
  const fav = useFavorites();
  const toast = useToast();

  const { data: post, loading, error, reload } = useFetch(() => baiDangApi.chiTiet(postId), [postId]);
  useDocumentTitle(post?.tieuDe);

  const [active, setActive] = useState(0);
  const [panel, setPanel] = useState<"none" | "message" | "report">("none");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <Spinner />;
  if (error || !post) return <ErrorBox message={error ?? "Không tìm thấy tin đăng."} onRetry={reload} />;

  const isOwner = user?.idNguoiDung === post.idNguoiDung;
  const images = post.anhs.length ? post.anhs : [""];
  const saved = fav.has(post.id);

  const requireLogin = () => {
    if (user) return true;
    toast("Đăng nhập để tiếp tục.", "info");
    navigate("/dang-nhap", { state: { from: `/bai-dang/${post.id}` } });
    return false;
  };

  const openPanel = (name: "message" | "report") => {
    if (!requireLogin()) return;
    setText("");
    setPanel(panel === name ? "none" : name);
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const msg = await tinNhanApi.gui(post.idNguoiDung, text.trim());
      toast("Đã gửi tin nhắn cho người bán.", "ok");
      navigate(`/tin-nhan/${msg.idHoiThoai}`);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const sendReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      await baoCaoApi.tao({ idBaiDang: post.id, noiDung: text.trim() });
      toast("Đã gửi báo cáo. Cảm ơn bạn đã giúp chợ sạch hơn.", "ok");
      setPanel("none");
      setText("");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const review = async (action: "duyet" | "tuChoi") => {
    setBusy(true);
    try {
      await (action === "duyet" ? baiDangApi.duyet(post.id) : baiDangApi.tuChoi(post.id));
      toast(action === "duyet" ? "Đã duyệt tin." : "Đã từ chối tin.", "ok");
      reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {isStaff && post.trangThai === "ChoDuyet" && (
        <div className="staff-bar" role="region" aria-label="Duyệt tin">
          <strong>Tin đang chờ duyệt.</strong>
          <button className="btn btn-ok btn-sm" disabled={busy} onClick={() => void review("duyet")}>
            <Icon name="check" size={16} /> Duyệt
          </button>
          <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => void review("tuChoi")}>
            <Icon name="x" size={16} /> Từ chối
          </button>
        </div>
      )}
      {post.trangThai !== "DaDuyet" && (
        <div className="alert" style={{ marginBottom: 16 }}>
          Tin này đang ở trạng thái “{TRANG_THAI_BAI_DANG[post.trangThai] ?? post.trangThai}” nên chưa hiện ở trang chủ và kết quả tìm kiếm.
        </div>
      )}

      <div className="detail">
        <div>
          <div className="gallery-main">
            <img src={imgSrc(images[active])} alt={post.tieuDe} onError={onImgError} />
          </div>
          {images.length > 1 && (
            <div className="thumbs" role="tablist" aria-label="Ảnh sản phẩm">
              {images.map((url, i) => (
                <button key={url + i} type="button" className={i === active ? "is-on" : ""} aria-label={`Ảnh ${i + 1}`} onClick={() => setActive(i)}>
                  <img src={imgSrc(url)} alt="" onError={onImgError} />
                </button>
              ))}
            </div>
          )}

          <section className="panel stack" style={{ marginTop: 24 }}>
            <h2>Mô tả chi tiết</h2>
            <p className="prose">{post.noiDung}</p>
          </section>
        </div>

        <aside className="detail-side">
          <div className="panel stack">
            <h1 style={{ fontSize: "1.45rem" }}>{post.tieuDe}</h1>
            <div>
              <span className="price-tag price-tag-lg">{formatPrice(post.giaTien)}</span>
            </div>
            <dl className="facts">
              <div>
                <dt>Sản phẩm</dt>
                <dd>{post.tenSanPham}</dd>
              </div>
              <div>
                <dt>Danh mục</dt>
                <dd>{post.tenDanhMuc}</dd>
              </div>
              <div>
                <dt>Khu vực</dt>
                <dd>{post.diaChi}</dd>
              </div>
              <div>
                <dt>Địa chỉ cụ thể</dt>
                <dd>{post.diaChiChiTiet}</dd>
              </div>
              <div>
                <dt>Đăng lúc</dt>
                <dd title={formatDate(post.ngayDang)}>{timeAgo(post.ngayDang)}</dd>
              </div>
            </dl>

            <div className="row">
              <button type="button" className={`btn ${saved ? "" : "btn-ghost"}`} aria-pressed={saved} onClick={() => void fav.toggle(post.id)}>
                <Icon name="heart" size={18} filled={saved} /> {saved ? "Đã lưu" : "Lưu tin"}
              </button>
              {!isOwner && (
                <button type="button" className="btn btn-sticker" onClick={() => openPanel("message")}>
                  <Icon name="chat" size={18} /> Nhắn cho người bán
                </button>
              )}
            </div>

            {panel === "message" && (
              <form className="stack" onSubmit={sendMessage}>
                <div className="field">
                  <label htmlFor="msg">Tin nhắn gửi {post.tenNguoiDang}</label>
                  <textarea id="msg" required maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ví dụ: Món này còn không bạn?" />
                </div>
                <button className="btn" disabled={busy}>
                  <Icon name="send" size={16} /> {busy ? "Đang gửi…" : "Gửi tin nhắn"}
                </button>
              </form>
            )}
          </div>

          <div className="panel stack">
            <div className="row">
              <span className="avatar">{post.tenNguoiDang.trim().charAt(0).toUpperCase()}</span>
              <div>
                <strong>{post.tenNguoiDang}</strong>
                <div className="hint">{isOwner ? "Đây là tin của bạn" : "Người bán"}</div>
              </div>
            </div>
            {!isOwner && (
              <>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => openPanel("report")}>
                  <Icon name="flag" size={16} /> Báo cáo tin này
                </button>
                {panel === "report" && (
                  <form className="stack" onSubmit={sendReport}>
                    <div className="field">
                      <label htmlFor="rp">Lý do báo cáo</label>
                      <textarea id="rp" required maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tin có dấu hiệu lừa đảo, sai danh mục, hàng cấm…" />
                    </div>
                    <button className="btn btn-danger" disabled={busy}>
                      {busy ? "Đang gửi…" : "Gửi báo cáo"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
          <Link to="/tim-kiem" className="muted">
            ← Quay lại danh sách
          </Link>
        </aside>
      </div>
    </>
  );
}
