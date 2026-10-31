import { useEffect, useState, type FormEvent } from "react";
import { authApi } from "../../../api/auth";
import { getErrorMessage } from "../../../utils/error";
import { AuthField } from "../AuthField";
import FormAlert from "../FormAlert";
import SubmitButton from "../SubmitButton";
import InfoNote from "./InfoNote";
import RecoveryHeading from "./RecoveryHeading";

const RESEND_SECONDS = 60;

interface Props {
  email: string;
  onVerified: (code: string) => void;
  onChangeEmail: () => void;
}

/** Bước 2: nhập mã 6 số nhận qua email; cho gửi lại sau 60 giây. */
export default function OtpStep({ email, onVerified, onChangeEmail }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError("Mã xác nhận gồm 6 chữ số.");
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await authApi.xacNhanMaDatLai(email, code);
      onVerified(code);
    } catch (err) {
      setError(getErrorMessage(err, "Mã xác nhận không đúng hoặc đã hết hạn."));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError("");
    setNotice("");
    try {
      await authApi.quenMatKhau(email);
      setCode("");
      setCooldown(RESEND_SECONDS);
      setNotice("Đã gửi mã mới. Mã cũ không còn dùng được.");
    } catch (err) {
      setError(getErrorMessage(err, "Chưa gửi lại được mã."));
    }
  };

  return (
    <>
      <RecoveryHeading
        icon="mark_email_read"
        title="Nhập mã xác nhận"
        subtitle={`Nếu ${email} đã đăng ký tài khoản, chúng tôi vừa gửi mã 6 số tới đó.`}
      />
      <form className="w-full text-left flex flex-col gap-space-lg" onSubmit={submit} noValidate>
        <AuthField
          id="recovery-code"
          label="Mã xác nhận"
          icon="pin"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
        <InfoNote>Mã có hiệu lực trong vài phút. Hãy kiểm tra cả hộp thư rác nếu chưa thấy email.</InfoNote>
        {error && <FormAlert message={error} />}
        {notice && (
          <p role="status" className="m-0 rounded-lg bg-secondary-container/40 text-on-secondary-container px-space-md py-space-sm font-caption-bold text-caption-bold">
            {notice}
          </p>
        )}
        <SubmitButton busy={busy} label="Xác nhận mã" busyLabel="Đang kiểm tra…" />
      </form>

      <div className="mt-space-xl flex flex-col items-center gap-space-xs font-body-2 text-body-2 text-on-surface-variant">
        <div className="flex items-center gap-space-2xs">
          <span>Chưa nhận được mã?</span>
          {cooldown > 0 ? (
            <span className="font-caption-bold text-caption-bold" aria-live="polite">Gửi lại sau {cooldown}s</span>
          ) : (
            <button type="button" onClick={() => void resend()} className="bg-transparent border-0 p-0 cursor-pointer text-primary font-caption-bold text-caption-bold hover:underline">
              Gửi lại mã
            </button>
          )}
        </div>
        <button type="button" onClick={onChangeEmail} className="bg-transparent border-0 p-0 cursor-pointer text-on-surface-variant font-caption text-caption hover:text-primary hover:underline">
          Dùng email khác
        </button>
      </div>
    </>
  );
}
