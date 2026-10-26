import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthFormHeader from "../../components/auth/AuthFormHeader";
import { AuthField, AuthSelect } from "../../components/auth/AuthField";
import AuthSwitchPrompt from "../../components/auth/AuthSwitchPrompt";
import FormAlert from "../../components/auth/FormAlert";
import SubmitButton from "../../components/auth/SubmitButton";
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
    <>
      <AuthFormHeader icon="person_add" eyebrow="Tạo tài khoản mới" title="Đăng ký thành viên" subtitle="Mất chưa đến một phút." />
      <form className="flex flex-col gap-space-lg" onSubmit={submit}>
        {error && <FormAlert message={error} />}
        <AuthField id="hoTen" label="Họ và tên" icon="badge" autoComplete="name" required maxLength={255} value={form.hoTen} onChange={(e) => set("hoTen", e.target.value)} />
        <AuthField id="email" label="Email" icon="mail" type="email" autoComplete="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        <AuthField id="sdt" label="Số điện thoại" icon="call" type="tel" autoComplete="tel" placeholder="0912345678" required value={form.soDienThoai} onChange={(e) => set("soDienThoai", e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
          <AuthField id="ngaySinh" label="Ngày sinh" icon="cake" type="date" required value={form.ngaySinh} onChange={(e) => set("ngaySinh", e.target.value)} />
          <AuthSelect id="gioiTinh" label="Giới tính" icon="wc" value={form.gioiTinh} onChange={(e) => set("gioiTinh", e.target.value as DangKyRequest["gioiTinh"])}>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </AuthSelect>
        </div>
        <AuthField
          id="matKhau"
          label="Mật khẩu"
          icon="lock"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          hint="Tối thiểu 6 ký tự."
          value={form.matKhau}
          onChange={(e) => set("matKhau", e.target.value)}
        />
        <SubmitButton busy={busy} label="Đăng ký" busyLabel="Đang tạo tài khoản…" />
      </form>
      <AuthSwitchPrompt text="Đã có tài khoản?" linkText="Đăng nhập" to="/dang-nhap" />
    </>
  );
}
