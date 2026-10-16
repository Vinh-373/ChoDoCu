import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getErrorMessage } from "../../utils/error";

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
    <div className="auth-wrap">
      <form className="panel auth-card stack" onSubmit={submit}>
        <div>
          <h1>Đăng nhập</h1>
          <p className="muted">Để đăng tin, lưu tin yêu thích và nhắn cho người bán.</p>
        </div>
        {error && <div className="alert" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="mk">Mật khẩu</label>
          <input id="mk" type="password" autoComplete="current-password" required value={matKhau} onChange={(e) => setMatKhau(e.target.value)} />
        </div>
        <button className="btn btn-block" disabled={busy}>
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
        <p className="muted">
          Chưa có tài khoản? <Link to="/dang-ky">Đăng ký</Link>
        </p>
      </form>
    </div>
  );
}
