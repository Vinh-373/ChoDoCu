import { useState, type FormEvent } from "react";
import { bannerApi } from "../../api/banner";
import Icon from "../../components/common/Icon";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/error";
import { imgSrc, onImgError } from "../../utils/image";

export default function AdminBanners() {
  useDocumentTitle("Banner");
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => bannerApi.danhSach(), []);
  const [url, setUrl] = useState("");
  const [pos, setPos] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingId === null) {
        await bannerApi.tao({ hinhAnh: url.trim(), viTri: pos.trim() || null });
        toast("Đã thêm banner.", "ok");
      } else {
        await bannerApi.capNhat(editingId, { hinhAnh: url.trim(), viTri: pos.trim() || null });
        toast("Đã cập nhật banner.", "ok");
      }
      setUrl("");
      setPos("");
      setEditingId(null);
      reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const edit = (id: number, image: string | null, position: string | null) => {
    setEditingId(id);
    setUrl(image ?? "");
    setPos(position ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUrl("");
    setPos("");
  };

  const remove = async (id: number) => {
    if (!window.confirm("Xoá banner này?")) return;
    try {
      await bannerApi.xoa(id);
      toast("Đã xoá banner.", "ok");
      if (editingId === id) cancelEdit();
      reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="stack">
      <h1>Banner</h1>
      <form className="panel row" onSubmit={add}>
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="u">Đường dẫn ảnh</label>
          <input id="u" type="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/banner.jpg" />
        </div>
        <div className="field">
          <label htmlFor="v">Vị trí</label>
          <input id="v" value={pos} onChange={(e) => setPos(e.target.value)} placeholder="TrangChu" />
        </div>
        <button className="btn" disabled={busy}>
          <Icon name={editingId === null ? "plus" : "check"} size={16} />
          {editingId === null ? "Thêm banner" : "Lưu thay đổi"}
        </button>
        {editingId !== null && <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Hủy sửa</button>}
      </form>

      {loading && !data ? (
        <Spinner />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <Empty title="Chưa có banner" />
      ) : (
        <div className="img-list">
          {data.map((b) => (
            <div key={b.id} className="img-row">
              <img src={imgSrc(b.hinhAnh)} alt="" onError={onImgError} />
              <span>{b.viTri ?? "—"} <small className="muted">· {b.trangThai}</small></span>
              <button className="icon-btn" aria-label={`Sửa banner ${b.id}`} onClick={() => edit(b.id, b.hinhAnh, b.viTri)}><Icon name="edit" size={18} /></button>
              <button className="icon-btn" aria-label={`Xoá banner ${b.id}`} onClick={() => void remove(b.id)}><Icon name="trash" size={18} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
