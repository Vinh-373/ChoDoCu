import { useEffect, useState, type FormEvent } from "react";
import { authApi } from "../../api/auth";
import { nguoiDungApi } from "../../api/nguoiDung";
import { useToast } from "../../contexts/ToastContext";
import { getErrorMessage } from "../../utils/error";
import FormAlert from "../auth/FormAlert";
import MaterialIcon from "../common/MaterialIcon";
import { Card, PasswordInput, TextInput } from "./FormControls";

const MIN_LENGTH = 6;
const RESEND_SECONDS = 60;

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 2)}${"*".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

const btn =
  "h-12 px-space-xl rounded-xl border-0 cursor-pointer bg-primary-container hover:bg-primary text-on-primary font-button-text text-button-text shadow-md inline-flex items-center gap-space-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed";

/**
 * Cách 2: nhận mã 6 số qua email của tài khoản, rồi nhập mã + mật khẩu mới ngay tại đây.
 * Dùng được cả khi quên mật khẩu hiện tại hoặc tài khoản đăng nhập bằng Google.
 */
export default function PasswordByEmail() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [moi, setMoi] = useState("");
  const [xacNhan, setXacNhan] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    nguoiDungApi
      .layHoSo()
      .then((h) => setEmail(h.email ?? ""))
      .catch((err) => setError(getErrorMessage(err, "Chưa tải được email tài khoản.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = async () => {
    setError("");
    setBusy(true);
    try {
      await authApi.quenMatKhau(email);
      setSent(true);
      setCode("");
      setCooldown(RESEND_SECONDS);
      toast("Đã gửi mã xác nhận tới email của bạn.", "ok");
    } catch (err) {
      setError(getErrorMessage(err, "Chưa gửi được mã. Vui lòng thử lại."));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError("Mã xác nhận gồm 6 chữ số.");
    if (moi.length < MIN_LENGTH) return setError(`Mật khẩu mới tối thiểu ${MIN_LENGTH} ký tự.`);
    if (moi !== xacNhan) return setError("Hai mật khẩu mới chưa khớp nhau.");
    setError("");
    setBusy(true);
    try {
      await authApi.datLaiMatKhau({ email, maXacNhan: code, matKhauMoi: moi });
      toast("Đã đổi mật khẩu.", "ok");
      setSent(false);
      setCode("");
      setMoi("");
      setXacNhan("");
    } catch (err) {
      setError(getErrorMessage(err, "Mã xác nhận không đúng hoặc đã hết hạn."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-space-xl">
      <form onSubmit={submit} className="flex flex-col gap-space-lg">
        <div className="flex items-start gap-space-md">
          <span className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
            <MaterialIcon name="forward_to_inbox" size={22} />
          </span>
          <div>
            <h2 className="m-0 font-headline-2 text-headline-2 text-on-surface">Đổi mật khẩu bằng mã gửi qua email</h2>
            <p className="m-0 mt-space-2xs font-body-2 text-body-2 text-on-surface-variant">
              Phù hợp khi bạn quên mật khẩu hiện tại hoặc tài khoản đăng nhập bằng Google. Mã gồm 6 số, chỉ có hiệu lực trong vài phút.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="m-0 font-body-2 text-body-2 text-on-surface-variant">Đang tải email tài khoản…</p>
        ) : email ? (
          <div className="rounded-xl bg-surface-container-low p-space-md font-body-2 text-body-2 text-on-surface">
            {sent ? "Đã gửi mã tới " : "Mã sẽ được gửi tới "}
            <strong className="font-caption-bold text-caption-bold">{maskEmail(email)}</strong>
            {sent && ". Kiểm tra cả hộp thư rác nếu chưa thấy."}
          </div>
        ) : (
          <FormAlert message="Tài khoản chưa có email nên không thể gửi mã." />
        )}

        {sent && (
          <>
            <TextInput
              id="ma-doi-mat-khau"
              label="Mã xác nhận"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
            <PasswordInput id="mat-khau-moi-email" label="Mật khẩu mới" required autoComplete="new-password" value={moi} onChange={(e) => setMoi(e.target.value)} hint={`Tối thiểu ${MIN_LENGTH} ký tự.`} />
            <PasswordInput id="xac-nhan-email" label="Xác nhận mật khẩu mới" required autoComplete="new-password" value={xacNhan} onChange={(e) => setXacNhan(e.target.value)} />
          </>
        )}

        {error && <FormAlert message={error} />}

        <div className="flex flex-wrap justify-end gap-space-sm">
          {(!sent || cooldown <= 0) && (
            <button
              type="button"
              onClick={sendCode}
              disabled={busy || loading || !email}
              className={sent ? "h-12 px-space-lg rounded-xl border-0 cursor-pointer bg-surface-container-high hover:bg-surface-variant font-button-text text-button-text text-on-surface disabled:opacity-70" : btn}
            >
              <MaterialIcon name="mail" size={18} />
              {sent ? "Gửi lại mã" : "Gửi mã qua email"}
            </button>
          )}
          {sent && cooldown > 0 && (
            <span className="self-center font-caption text-caption text-on-surface-variant" aria-live="polite">Gửi lại mã sau {cooldown}s</span>
          )}
          {sent && (
            <button type="submit" disabled={busy} className={btn}>
              <MaterialIcon name={busy ? "progress_activity" : "shield_lock"} size={18} className={busy ? "animate-spin" : ""} />
              {busy ? "Đang cập nhật…" : "Lưu mật khẩu mới"}
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}
