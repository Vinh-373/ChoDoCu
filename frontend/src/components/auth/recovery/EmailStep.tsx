import { useState, type FormEvent } from "react";
import { authApi } from "../../../api/auth";
import { getErrorMessage } from "../../../utils/error";
import { AuthField } from "../AuthField";
import FormAlert from "../FormAlert";
import SubmitButton from "../SubmitButton";
import InfoNote from "./InfoNote";
import RecoveryHeading from "./RecoveryHeading";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  initialEmail: string;
  onSent: (email: string) => void;
}

/** Bước 1: nhập email để nhận mã OTP. */
export default function EmailStep({ initialEmail, onSent }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) return setError("Email không đúng định dạng.");
    setError("");
    setBusy(true);
    try {
      await authApi.quenMatKhau(value);
      onSent(value);
    } catch (err) {
      setError(getErrorMessage(err, "Chưa gửi được mã xác thực. Vui lòng thử lại."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <RecoveryHeading
        icon="lock_reset"
        title="Khôi phục mật khẩu"
        subtitle="Nhập địa chỉ email đã đăng ký để nhận mã xác thực (OTP) đặt lại mật khẩu của bạn."
      />
      <form className="w-full text-left flex flex-col gap-space-lg" onSubmit={submit} noValidate>
        <AuthField
          id="recovery-email"
          label="Email"
          icon="contact_mail"
          type="email"
          autoComplete="email"
          placeholder="Ví dụ: name@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InfoNote>Mã OTP gồm 6 chữ số sẽ được gửi tới email của bạn trong vòng vài giây.</InfoNote>
        {error && <FormAlert message={error} />}
        <SubmitButton busy={busy} label="Gửi mã xác thực" busyLabel="Đang gửi mã…" />
      </form>
    </>
  );
}
