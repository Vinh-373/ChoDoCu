import { useState, type FormEvent } from "react";
import { authApi } from "../../../api/auth";
import { getErrorMessage } from "../../../utils/error";
import { AuthField } from "../AuthField";
import FormAlert from "../FormAlert";
import SubmitButton from "../SubmitButton";
import RecoveryHeading from "./RecoveryHeading";

interface Props {
  email: string;
  code: string;
  onDone: () => void;
}

/** Bước 3: đặt mật khẩu mới. Quy tắc độ dài khớp với đăng ký (tối thiểu 6 ký tự). */
export default function NewPasswordStep({ email, code, onDone }: Props) {
  const [matKhau, setMatKhau] = useState("");
  const [xacNhan, setXacNhan] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (matKhau.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự.");
    if (matKhau !== xacNhan) return setError("Hai mật khẩu chưa khớp nhau.");
    setError("");
    setBusy(true);
    try {
      await authApi.datLaiMatKhau({ email, maXacNhan: code, matKhauMoi: matKhau });
      onDone();
    } catch (err) {
      setError(getErrorMessage(err, "Chưa đặt lại được mật khẩu. Mã có thể đã hết hạn, hãy yêu cầu mã mới."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <RecoveryHeading icon="password" title="Đặt mật khẩu mới" subtitle="Chọn mật khẩu mà bạn chưa dùng ở nơi khác để tài khoản an toàn hơn." />
      <form className="w-full text-left flex flex-col gap-space-lg" onSubmit={submit}>
        <AuthField
          id="new-password"
          label="Mật khẩu mới"
          icon="lock"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          hint="Tối thiểu 6 ký tự."
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
        />
        <AuthField
          id="confirm-password"
          label="Nhập lại mật khẩu mới"
          icon="lock_reset"
          type="password"
          autoComplete="new-password"
          required
          value={xacNhan}
          onChange={(e) => setXacNhan(e.target.value)}
        />
        {error && <FormAlert message={error} />}
        <SubmitButton busy={busy} label="Đặt lại mật khẩu" busyLabel="Đang cập nhật…" />
      </form>
    </>
  );
}
