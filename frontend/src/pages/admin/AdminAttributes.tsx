import { useState, type FormEvent } from "react";
import { adminApi } from "../../api/admin";
import { danhMucApi } from "../../api/danhMuc";
import Icon from "../../components/common/Icon";
import Pagination from "../../components/common/Pagination";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/error";
import { flattenCategories } from "../../utils/category";
import type { AdminAttribute } from "../../types";

interface AttributeForm {
  idDanhMuc: string;
  idThuocTinhCha: string;
  tenThuocTinh: string;
  kieuDuLieu: AdminAttribute["kieuDuLieu"];
  danhSachGiaTriLuaChon: string;
  batBuoc: boolean;
  thuTu: string;
  trangThai: string;
}
const EMPTY_FORM: AttributeForm = {
  idDanhMuc: "",
  idThuocTinhCha: "",
  tenThuocTinh: "",
  kieuDuLieu: "Text",
  danhSachGiaTriLuaChon: "",
  batBuoc: false,
  thuTu: "0",
  trangThai: "HoatDong",
};

export default function AdminAttributes() {
  useDocumentTitle("Thuộc tính sản phẩm");
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminAttribute | null>(null);
  const [form, setForm] = useState<AttributeForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const attributes = useFetch(() => adminApi.thuocTinh({ page, pageSize: 15 }), [page]);
  const categories = useFetch(() => danhMucApi.cay(), []);
  const flatCategories = flattenCategories(categories.data ?? []);

  const reset = () => { setEditing(null); setForm(EMPTY_FORM); };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        idDanhMuc: form.idDanhMuc ? Number(form.idDanhMuc) : null,
        idThuocTinhCha: form.idThuocTinhCha ? Number(form.idThuocTinhCha) : null,
        tenThuocTinh: form.tenThuocTinh.trim(),
        kieuDuLieu: form.kieuDuLieu,
        danhSachGiaTriLuaChon: form.danhSachGiaTriLuaChon.split(",").map((value) => value.trim()).filter(Boolean),
        batBuoc: form.batBuoc,
        thuTu: Number(form.thuTu),
        trangThai: form.trangThai,
      };
      if (editing) await adminApi.capNhatThuocTinh(editing.id, payload);
      else await adminApi.taoThuocTinh(payload);
      toast(editing ? "Đã cập nhật thuộc tính." : "Đã thêm thuộc tính.", "ok");
      reset();
      attributes.reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const edit = (attribute: AdminAttribute) => {
    setEditing(attribute);
    setForm({
      idDanhMuc: attribute.idDanhMuc === null ? "" : String(attribute.idDanhMuc),
      idThuocTinhCha: attribute.idThuocTinhCha === null ? "" : String(attribute.idThuocTinhCha),
      tenThuocTinh: attribute.tenThuocTinh,
      kieuDuLieu: attribute.kieuDuLieu,
      danhSachGiaTriLuaChon: attribute.danhSachGiaTriLuaChon.join(", "),
      batBuoc: attribute.batBuoc,
      thuTu: String(attribute.thuTu),
      trangThai: attribute.trangThai,
    });
  };
  const remove = async (attribute: AdminAttribute) => {
    if (!window.confirm(`Xóa thuộc tính “${attribute.tenThuocTinh}”?`)) return;
    try {
      await adminApi.xoaThuocTinh(attribute.id);
      toast("Đã xóa thuộc tính.", "ok");
      if (editing?.id === attribute.id) reset();
      attributes.reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="stack">
      <h1>Thuộc tính sản phẩm</h1>
      {categories.error && <ErrorBox message={categories.error} onRetry={categories.reload} />}
      <form className="panel stack" onSubmit={submit}>
        <h2>{editing ? `Sửa thuộc tính #${editing.id}` : "Thêm thuộc tính"}</h2>
        <div className="row">
          <div className="field">
            <label htmlFor="attribute-name">Tên thuộc tính</label>
            <input id="attribute-name" required maxLength={255} value={form.tenThuocTinh}
              onChange={(e) => setForm({ ...form, tenThuocTinh: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="attribute-category">Danh mục áp dụng</label>
            <select id="attribute-category" value={form.idDanhMuc}
              onChange={(e) => setForm({ ...form, idDanhMuc: e.target.value })}>
              <option value="">Dùng chung</option>
              {flatCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="attribute-parent">Thuộc tính cha (mã)</label>
            <input id="attribute-parent" type="number" min="1" value={form.idThuocTinhCha}
              onChange={(e) => setForm({ ...form, idThuocTinhCha: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="attribute-type">Kiểu dữ liệu</label>
            <select id="attribute-type" value={form.kieuDuLieu}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "Text" || value === "So" || value === "LuaChon")
                  setForm({ ...form, kieuDuLieu: value });
              }}>
              <option value="Text">Văn bản</option>
              <option value="So">Số</option>
              <option value="LuaChon">Danh sách lựa chọn</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="attribute-order">Thứ tự</label>
            <input id="attribute-order" type="number" min="0" value={form.thuTu}
              onChange={(e) => setForm({ ...form, thuTu: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="attribute-status">Trạng thái</label>
            <select id="attribute-status" value={form.trangThai}
              onChange={(e) => setForm({ ...form, trangThai: e.target.value })}>
              <option value="HoatDong">Hoạt động</option>
              <option value="An">Ẩn</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="attribute-options">Giá trị lựa chọn (phân cách bằng dấu phẩy)</label>
            <input id="attribute-options" value={form.danhSachGiaTriLuaChon}
              onChange={(e) => setForm({ ...form, danhSachGiaTriLuaChon: e.target.value })}
              disabled={form.kieuDuLieu !== "LuaChon"} placeholder="Đỏ, Xanh, Đen" />
          </div>
          <label className="row">
            <input type="checkbox" checked={form.batBuoc}
              onChange={(e) => setForm({ ...form, batBuoc: e.target.checked })} />
            Bắt buộc
          </label>
        </div>
        <div className="row">
          <button className="btn" disabled={busy || categories.loading}>
            <Icon name={editing ? "check" : "plus"} size={16} /> {editing ? "Lưu thuộc tính" : "Thêm thuộc tính"}
          </button>
          {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Hủy sửa</button>}
        </div>
      </form>

      {attributes.loading && !attributes.data ? (
        <Spinner />
      ) : attributes.error ? (
        <ErrorBox message={attributes.error} onRetry={attributes.reload} />
      ) : !attributes.data || attributes.data.items.length === 0 ? (
        <Empty title="Chưa có thuộc tính" />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tên</th><th>Kiểu</th><th>Danh mục</th><th>Bắt buộc</th><th>Trạng thái</th><th /></tr></thead>
              <tbody>
                {attributes.data.items.map((attribute) => (
                  <tr key={attribute.id}>
                    <td>{attribute.tenThuocTinh}</td>
                    <td>{attribute.kieuDuLieu}</td>
                    <td>{flatCategories.find((category) => category.id === attribute.idDanhMuc)?.tenDanhMuc ?? "Dùng chung"}</td>
                    <td>{attribute.batBuoc ? "Có" : "Không"}</td>
                    <td><span className="badge">{attribute.trangThai}</span></td>
                    <td className="row">
                      <button className="icon-btn" aria-label={`Sửa thuộc tính ${attribute.tenThuocTinh}`} onClick={() => edit(attribute)}><Icon name="edit" size={16} /></button>
                      <button className="icon-btn" aria-label={`Xóa thuộc tính ${attribute.tenThuocTinh}`} onClick={() => void remove(attribute)}><Icon name="trash" size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={attributes.data.page} totalPages={attributes.data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
