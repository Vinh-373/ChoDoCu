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
import { formatPrice } from "../../utils/format";
import { flattenCategories } from "../../utils/category";
import type { AdminProduct } from "../../types";

interface ProductForm {
  idDanhMuc: string;
  idHang: string;
  idDongSanPham: string;
  idDongCuThe: string;
  tenSanPham: string;
  giaTien: string;
  moTa: string;
}

const EMPTY_FORM: ProductForm = {
  idDanhMuc: "",
  idHang: "",
  idDongSanPham: "",
  idDongCuThe: "",
  tenSanPham: "",
  giaTien: "",
  moTa: "",
};

const optionalId = (value: string) => value.trim() ? Number(value) : null;

export default function AdminProducts() {
  useDocumentTitle("Quản lý sản phẩm");
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const products = useFetch(() => adminApi.sanPham({ page, pageSize: 15 }), [page]);
  const categories = useFetch(() => danhMucApi.cay(), []);
  const brands = useFetch(() => adminApi.hang({ page: 1, pageSize: 100 }), []);

  const reset = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        idDanhMuc: Number(form.idDanhMuc),
        idHang: optionalId(form.idHang),
        idDongSanPham: optionalId(form.idDongSanPham),
        idDongCuThe: optionalId(form.idDongCuThe),
        tenSanPham: form.tenSanPham.trim(),
        giaTien: Number(form.giaTien),
        moTa: form.moTa.trim(),
      };
      if (editing) await adminApi.capNhatSanPham(editing.id, payload);
      else await adminApi.taoSanPham(payload);
      toast(editing ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm.", "ok");
      reset();
      products.reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const edit = (product: AdminProduct) => {
    setEditing(product);
    setForm({
      idDanhMuc: String(product.idDanhMuc),
      idHang: product.idHang === null ? "" : String(product.idHang),
      idDongSanPham: product.idDongSanPham === null ? "" : String(product.idDongSanPham),
      idDongCuThe: product.idDongCuThe === null ? "" : String(product.idDongCuThe),
      tenSanPham: product.tenSanPham,
      giaTien: String(product.giaTien),
      moTa: product.moTa,
    });
  };

  const remove = async (product: AdminProduct) => {
    if (!window.confirm(`Xóa sản phẩm “${product.tenSanPham}”?`)) return;
    try {
      await adminApi.xoaSanPham(product.id);
      toast("Đã xóa sản phẩm.", "ok");
      if (editing?.id === product.id) reset();
      products.reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  const flatCategories = flattenCategories(categories.data ?? []);

  return (
    <div className="stack">
      <h1>Quản lý sản phẩm</h1>
      {(categories.error || brands.error) && (
        <ErrorBox
          message={categories.error ?? brands.error ?? "Không tải được dữ liệu tham chiếu."}
          onRetry={() => { categories.reload(); brands.reload(); }}
        />
      )}
      <form className="panel stack" onSubmit={submit}>
        <h2>{editing ? `Sửa sản phẩm #${editing.id}` : "Thêm sản phẩm"}</h2>
        <div className="row">
          <div className="field">
            <label htmlFor="product-name">Tên sản phẩm</label>
            <input id="product-name" required maxLength={255} value={form.tenSanPham}
              onChange={(e) => setForm({ ...form, tenSanPham: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="product-category">Danh mục</label>
            <select id="product-category" required value={form.idDanhMuc}
              onChange={(e) => setForm({ ...form, idDanhMuc: e.target.value })}>
              <option value="">Chọn danh mục</option>
              {flatCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="product-brand">Hãng</label>
            <select id="product-brand" value={form.idHang}
              onChange={(e) => setForm({ ...form, idHang: e.target.value })}>
              <option value="">Không chọn hãng</option>
              {(brands.data?.items ?? []).map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.tenHang}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="product-series">Mã dòng sản phẩm (nếu có)</label>
            <input id="product-series" type="number" min="1" value={form.idDongSanPham}
              onChange={(e) => setForm({ ...form, idDongSanPham: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="product-model">Mã dòng cụ thể (nếu có)</label>
            <input id="product-model" type="number" min="1" value={form.idDongCuThe}
              onChange={(e) => setForm({ ...form, idDongCuThe: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="product-price">Giá tham khảo</label>
            <input id="product-price" type="number" min="0" step="1000" required value={form.giaTien}
              onChange={(e) => setForm({ ...form, giaTien: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="product-description">Mô tả</label>
          <textarea id="product-description" rows={3} value={form.moTa}
            onChange={(e) => setForm({ ...form, moTa: e.target.value })} />
        </div>
        <div className="row">
          <button className="btn" disabled={busy || categories.loading || brands.loading || flatCategories.length === 0}>
            <Icon name={editing ? "check" : "plus"} size={16} /> {editing ? "Lưu sản phẩm" : "Thêm sản phẩm"}
          </button>
          {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Hủy sửa</button>}
        </div>
      </form>

      {products.loading && !products.data ? (
        <Spinner />
      ) : products.error ? (
        <ErrorBox message={products.error} onRetry={products.reload} />
      ) : !products.data || products.data.items.length === 0 ? (
        <Empty title="Chưa có sản phẩm" />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Hãng</th><th>Giá</th><th /></tr></thead>
              <tbody>
                {products.data.items.map((product) => (
                  <tr key={product.id}>
                    <td>{product.tenSanPham}</td>
                    <td>{product.tenDanhMuc}</td>
                    <td>{product.tenHang ?? "—"}</td>
                    <td>{formatPrice(product.giaTien)}</td>
                    <td className="row">
                      <button className="icon-btn" aria-label={`Sửa ${product.tenSanPham}`} onClick={() => edit(product)}><Icon name="edit" size={16} /></button>
                      <button className="icon-btn" aria-label={`Xóa ${product.tenSanPham}`} onClick={() => void remove(product)}><Icon name="trash" size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={products.data.page} totalPages={products.data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
