import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthFormHeader from "../../components/auth/AuthFormHeader";
import { AuthField } from "../../components/auth/AuthField";
import AuthSwitchPrompt from "../../components/auth/AuthSwitchPrompt";
import FormAlert from "../../components/auth/FormAlert";
import SubmitButton from "../../components/auth/SubmitButton";
import { useAuth } from "../../contexts/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getErrorMessage } from "../../utils/error";

/** Trang con của AuthLayout: khung hai cột do AuthLayout lo, ở đây chỉ có form. */
export default function LoginPage() {
  useDocumentTitle("Đăng nhập");
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login({ email: email.trim(), matKhau });
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Đăng nhập không thành công."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AuthFormHeader
        icon="lock_open"
        eyebrow="Cổng đăng nhập an toàn"
        title="Chào mừng trở lại!"
        subtitle="Đăng nhập để tiếp tục quản lý tin và giao dịch mua bán"
      />
      <form className="flex flex-col gap-space-lg" onSubmit={submit}>
        {error && <FormAlert message={error} />}
        <AuthField
          id="email"
          label="Email"
          icon="mail"
          type="email"
          autoComplete="email"
          placeholder="Nhập email của bạn"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          id="matKhau"
          label="Mật khẩu"
          icon="lock"
          type="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu của bạn"
          required
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
        />
        <SubmitButton busy={busy} label="Đăng nhập" busyLabel="Đang đăng nhập…" />
      </form>
      <AuthSwitchPrompt text="Chưa có tài khoản?" linkText="Đăng ký ngay" to="/dang-ky" />
    </>
  );
}
