import { useState, type FormEvent } from "react";
import { danhMucApi } from "../../api/danhMuc";
import Icon from "../../components/common/Icon";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/error";
import type { DanhMuc } from "../../types";
import { flattenCategories } from "../../utils/category";

export default function AdminCategories() {
  useDocumentTitle("Danh mục");
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => danhMucApi.cay(), []);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [parent, setParent] = useState("");
  const [editing, setEditing] = useState<DanhMuc | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editStatus, setEditStatus] = useState("HoatDong");
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>, okMsg: string) => {
    setBusy(true);
    try {
      await fn();
      toast(okMsg, "ok");
      reload();
      return true;
    } catch (err) {
      toast(getErrorMessage(err), "error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const saved = await run(() => danhMucApi.tao({
      idDanhMucCha: parent ? Number(parent) : null,
      tenDanhMuc: name.trim(),
      anhDanhMuc: image.trim() || null,
    }), "Đã thêm danh mục.");
    if (saved) {
      setName("");
      setImage("");
    }
  };

  const rename = (c: DanhMuc) => {
    setEditing(c);
    setEditName(c.tenDanhMuc);
    setEditImage(c.anhDanhMuc ?? "");
    setEditStatus(c.trangThai);
  };
  const remove = (c: DanhMuc) => {
    if (window.confirm(`Xoá danh mục “${c.tenDanhMuc}”?`)) void run(() => danhMucApi.xoa(c.id), "Đã xoá danh mục.");
  };

  const renderNode = (c: DanhMuc) => (
    <li key={c.id} className="node">
      <div className="row">
        <strong>{c.tenDanhMuc}</strong>
        <span className="hint">#{c.id}</span>
        <span className="badge">{c.trangThai}</span>
        <button className="icon-btn" aria-label={`Đổi tên ${c.tenDanhMuc}`} disabled={busy} onClick={() => rename(c)}><Icon name="edit" size={16} /></button>
        <button className="icon-btn" aria-label={`Xoá ${c.tenDanhMuc}`} disabled={busy} onClick={() => remove(c)}><Icon name="trash" size={16} /></button>
      </div>
      {c.danhMucCons.length > 0 && <ul>{c.danhMucCons.map(renderNode)}</ul>}
    </li>
  );

  return (
    <div className="stack">
      <h1>Danh mục</h1>
      <form className="panel row" onSubmit={add}>
        <div className="field">
          <label htmlFor="n">Tên danh mục mới</label>
          <input id="n" required maxLength={255} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="category-image">Đường dẫn ảnh</label>
          <input id="category-image" type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" />
        </div>
        <div className="field">
          <label htmlFor="p">Thuộc danh mục</label>
          <select id="p" value={parent} onChange={(e) => setParent(e.target.value)}>
            <option value="">Danh mục gốc</option>
            {flattenCategories(data ?? []).map((category) => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
        </div>
        <button className="btn" disabled={busy}><Icon name="plus" size={16} /> Thêm</button>
      </form>

      {editing && (
        <form
          className="panel stack"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              const saved = await run(() => danhMucApi.capNhat(editing.id, {
                tenDanhMuc: editName.trim(),
                anhDanhMuc: editImage.trim() || null,
                trangThai: editStatus,
              }), "Đã cập nhật danh mục.");
              if (saved) setEditing(null);
            })();
          }}
        >
          <div className="row">
            <h2>Chỉnh sửa: {editing.tenDanhMuc}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Hủy</button>
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="edit-category-name">Tên danh mục</label>
              <input id="edit-category-name" required maxLength={255} value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="edit-category-image">Đường dẫn ảnh</label>
              <input id="edit-category-image" type="url" value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="https://…" />
            </div>
            <div className="field">
              <label htmlFor="edit-category-status">Trạng thái</label>
              <select id="edit-category-status" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                <option value="HoatDong">Hoạt động</option>
                <option value="An">Ẩn</option>
              </select>
            </div>
            <button className="btn" disabled={busy}>Lưu thay đổi</button>
          </div>
        </form>
      )}

      {loading && !data ? (
        <Spinner />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <Empty title="Chưa có danh mục" />
      ) : (
        <ul className="tree panel">{data.map(renderNode)}</ul>
      )}
    </div>
  );
}
