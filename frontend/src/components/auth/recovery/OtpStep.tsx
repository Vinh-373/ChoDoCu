import { useEffect, useState, type FormEvent } from "react";
import { authApi } from "../../../api/auth";
import { getErrorMessage } from "../../../utils/error";
import FormAlert from "../FormAlert";
import SubmitButton from "../SubmitButton";
import OtpInput from "./OtpInput";
import RecoveryHeading from "./RecoveryHeading";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

interface Props {
  email: string;
  onVerified: (resetToken: string) => void;
  onChangeEmail: () => void;
}

/** Bước 2: nhập mã OTP; có đếm ngược trước khi cho gửi lại. */
export default function OtpStep({ email, onVerified, onChangeEmail }: Props) {
  const [otp, setOtp] = useState("");
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
    if (otp.length < OTP_LENGTH) return setError(`Hãy nhập đủ ${OTP_LENGTH} chữ số.`);
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const { resetToken } = await authApi.xacThucOtp(email, otp);
      onVerified(resetToken);
    } catch (err) {
      setError(getErrorMessage(err, "Mã xác thực không đúng hoặc đã hết hạn."));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError("");
    setNotice("");
    try {
      await authApi.quenMatKhau(email);
      setOtp("");
      setCooldown(RESEND_SECONDS);
      setNotice("Đã gửi lại mã mới. Mã cũ không còn dùng được.");
    } catch (err) {
      setError(getErrorMessage(err, "Chưa gửi lại được mã."));
    }
  };

  return (
    <>
      <RecoveryHeading
        icon="mark_email_read"
        title="Nhập mã xác thực"
        subtitle={`Chúng tôi đã gửi mã ${OTP_LENGTH} chữ số tới ${email}. Hãy kiểm tra cả hộp thư rác.`}
      />
      <form className="w-full flex flex-col gap-space-lg" onSubmit={submit}>
        <OtpInput
          value={otp}
          onChange={(v) => {
            setOtp(v);
            setError(""); // sửa mã thì bỏ thông báo lỗi cũ
          }}
          length={OTP_LENGTH}
          disabled={busy}
        />
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
