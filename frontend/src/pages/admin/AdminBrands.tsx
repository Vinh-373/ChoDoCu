import { useState, type FormEvent } from "react";
import { adminApi } from "../../api/admin";
import Icon from "../../components/common/Icon";
import Pagination from "../../components/common/Pagination";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/error";
import type { AdminBrand } from "../../types";

interface BrandForm {
  tenHang: string;
  logo: string;
  trangThai: string;
}
const EMPTY_FORM: BrandForm = { tenHang: "", logo: "", trangThai: "HoatDong" };

export default function AdminBrands() {
  useDocumentTitle("Quản lý hãng");
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminBrand | null>(null);
  const [form, setForm] = useState<BrandForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useFetch(() => adminApi.hang({ page, pageSize: 15 }), [page]);

  const reset = () => { setEditing(null); setForm(EMPTY_FORM); };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { tenHang: form.tenHang.trim(), logo: form.logo.trim() || null, trangThai: form.trangThai };
      if (editing) await adminApi.capNhatHang(editing.id, payload);
      else await adminApi.taoHang(payload);
      toast(editing ? "Đã cập nhật hãng." : "Đã thêm hãng.", "ok");
      reset();
      reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const edit = (brand: AdminBrand) => {
    setEditing(brand);
    setForm({ tenHang: brand.tenHang, logo: brand.logo ?? "", trangThai: brand.trangThai });
  };
  const remove = async (brand: AdminBrand) => {
    if (!window.confirm(`Xóa hãng “${brand.tenHang}”?`)) return;
    try {
      await adminApi.xoaHang(brand.id);
      toast("Đã xóa hãng.", "ok");
      if (editing?.id === brand.id) reset();
      reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="stack">
      <h1>Quản lý hãng</h1>
      <form className="panel row" onSubmit={submit}>
        <div className="field">
          <label htmlFor="brand-name">Tên hãng</label>
          <input id="brand-name" required maxLength={255} value={form.tenHang}
            onChange={(e) => setForm({ ...form, tenHang: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="brand-logo">Đường dẫn logo</label>
          <input id="brand-logo" type="url" value={form.logo}
            onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://…" />
        </div>
        <div className="field">
          <label htmlFor="brand-status">Trạng thái</label>
          <select id="brand-status" value={form.trangThai} onChange={(e) => setForm({ ...form, trangThai: e.target.value })}>
            <option value="HoatDong">Hoạt động</option>
            <option value="An">Ẩn</option>
          </select>
        </div>
        <button className="btn" disabled={busy}>
          <Icon name={editing ? "check" : "plus"} size={16} /> {editing ? "Lưu" : "Thêm hãng"}
        </button>
        {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Hủy</button>}
      </form>

      {loading && !data ? (
        <Spinner />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <Empty title="Chưa có hãng" />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Hãng</th><th>Logo</th><th>Trạng thái</th><th /></tr></thead>
              <tbody>
                {data.items.map((brand) => (
                  <tr key={brand.id}>
                    <td>{brand.tenHang}</td>
                    <td>{brand.logo ? <a href={brand.logo} target="_blank" rel="noreferrer">Xem logo</a> : "—"}</td>
                    <td><span className="badge">{brand.trangThai}</span></td>
                    <td className="row">
                      <button className="icon-btn" aria-label={`Sửa hãng ${brand.tenHang}`} onClick={() => edit(brand)}><Icon name="edit" size={16} /></button>
                      <button className="icon-btn" aria-label={`Xóa hãng ${brand.tenHang}`} onClick={() => void remove(brand)}><Icon name="trash" size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
