import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { DangKyRequest } from "../../types";
import { getErrorMessage } from "../../utils/error";

export default function RegisterPage() {
  useDocumentTitle("Đăng ký");
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<DangKyRequest>({
    hoTen: "",
    email: "",
    soDienThoai: "",
    matKhau: "",
    ngaySinh: "",
    gioiTinh: "Nam",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = <K extends keyof DangKyRequest>(key: K, value: DangKyRequest[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    // Kiểm tra trước những điều BE sẽ từ chối, để người dùng biết ngay.
    if (!/^(0|\+84)\d{9}$/.test(form.soDienThoai)) return setError("Số điện thoại không hợp lệ (ví dụ 0912345678).");
    if (form.matKhau.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự.");
    if (new Date(form.ngaySinh) >= new Date()) return setError("Ngày sinh phải ở quá khứ.");

    setBusy(true);
    try {
      await register({ ...form, hoTen: form.hoTen.trim(), email: form.email.trim() });
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Đăng ký không thành công."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="panel auth-card stack" onSubmit={submit}>
        <div>
          <h1>Tạo tài khoản</h1>
          <p className="muted">Mất chưa đến một phút.</p>
        </div>
        {error && <div className="alert" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="hoTen">Họ và tên</label>
          <input id="hoTen" type="text" autoComplete="name" required maxLength={255} value={form.hoTen} onChange={(e) => set("hoTen", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="sdt">Số điện thoại</label>
          <input id="sdt" type="tel" autoComplete="tel" required value={form.soDienThoai} onChange={(e) => set("soDienThoai", e.target.value)} />
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="ns">Ngày sinh</label>
            <input id="ns" type="date" required value={form.ngaySinh} onChange={(e) => set("ngaySinh", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="gt">Giới tính</label>
            <select id="gt" value={form.gioiTinh} onChange={(e) => set("gioiTinh", e.target.value as DangKyRequest["gioiTinh"])}>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="mk">Mật khẩu</label>
          <input id="mk" type="password" autoComplete="new-password" required minLength={6} value={form.matKhau} onChange={(e) => set("matKhau", e.target.value)} />
          <span className="hint">Tối thiểu 6 ký tự.</span>
        </div>
        <button className="btn btn-block" disabled={busy}>
          {busy ? "Đang tạo tài khoản…" : "Đăng ký"}
        </button>
        <p className="muted">
          Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
