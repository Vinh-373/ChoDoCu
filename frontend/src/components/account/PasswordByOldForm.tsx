import { useState, type FormEvent } from "react";
import { authApi } from "../../api/auth";
import { Card, PasswordInput } from "./FormControls";
import FormAlert from "../auth/FormAlert";
import MaterialIcon from "../common/MaterialIcon";
import { useToast } from "../../contexts/ToastContext";
import { getErrorMessage } from "../../utils/error";

const MIN_LENGTH = 6; // khớp quy tắc đăng ký

const CRITERIA = [
  { key: "len", label: "Tối thiểu 8 ký tự", test: (v: string) => v.length >= 8 },
  { key: "case", label: "Chữ hoa & chữ thường", test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { key: "num", label: "Chứa chữ số (0-9)", test: (v: string) => /\d/.test(v) },
  { key: "sym", label: "Chứa ký tự đặc biệt (!@#$…)", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];
const LEVELS = [
  { label: "Quá ngắn", bar: "bg-error", text: "text-error" },
  { label: "Yếu", bar: "bg-error", text: "text-error" },
  { label: "Trung bình", bar: "bg-tertiary-container", text: "text-tertiary" },
  { label: "Khá", bar: "bg-tertiary-container", text: "text-tertiary" },
  { label: "Rất mạnh", bar: "bg-secondary", text: "text-secondary" },
];

/** Cách 1: đổi mật khẩu bằng mật khẩu hiện tại. */
export default function PasswordByOldForm() {
  const toast = useToast();
  const [cu, setCu] = useState("");
  const [moi, setMoi] = useState("");
  const [xacNhan, setXacNhan] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const passed = CRITERIA.filter((c) => c.test(moi)).length;
  const level = LEVELS[moi.length < MIN_LENGTH ? 0 : passed];
  const matched = xacNhan.length > 0 && xacNhan === moi;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (moi.length < MIN_LENGTH) return setError(`Mật khẩu mới tối thiểu ${MIN_LENGTH} ký tự.`);
    if (moi === cu) return setError("Mật khẩu mới phải khác mật khẩu hiện tại.");
    if (moi !== xacNhan) return setError("Hai mật khẩu mới chưa khớp nhau.");
    setError("");
    setBusy(true);
    try {
      await authApi.doiMatKhau({ matKhauCu: cu, matKhauMoi: moi, xacNhanMatKhau: xacNhan });
      setCu("");
      setMoi("");
      setXacNhan("");
      toast("Đã đổi mật khẩu.", "ok");
    } catch (err) {
      setError(getErrorMessage(err, "Chưa đổi được mật khẩu. Vui lòng thử lại."));
    } finally {
      setBusy(false);
    }
  };

  return (
      <Card className="p-space-xl">
        <form onSubmit={submit} className="flex flex-col gap-space-lg">
          <PasswordInput
            id="mat-khau-cu"
            label="Mật khẩu hiện tại"
            required
            autoComplete="current-password"
            value={cu}
            onChange={(e) => setCu(e.target.value)}
            hint="Bạn cần xác thực mật khẩu hiện tại trước khi tạo khóa mới."
          />

          <div className="flex flex-col gap-space-md">
            <PasswordInput id="mat-khau-moi" label="Mật khẩu mới" required autoComplete="new-password" value={moi} onChange={(e) => setMoi(e.target.value)} />
            <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-sm" aria-live="polite">
              <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant">
                <span>Độ mạnh mật khẩu:</span>
                <span className={`font-caption-bold text-caption-bold ${moi ? level.text : ""}`}>{moi ? level.label : "—"}</span>
              </div>
              <div className="grid grid-cols-4 gap-space-xs" aria-hidden="true">
                {CRITERIA.map((c, i) => (
                  <span key={c.key} className={`h-1.5 rounded-full ${moi && i < passed ? level.bar : "bg-surface-variant"}`} />
                ))}
              </div>
              <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 gap-x-space-lg gap-y-space-xs">
                {CRITERIA.map((c) => {
                  const ok = c.test(moi);
                  return (
                    <li key={c.key} className={`flex items-center gap-space-xs font-caption text-caption ${ok ? "text-secondary" : "text-on-surface-variant"}`}>
                      <MaterialIcon name={ok ? "check_circle" : "radio_button_unchecked"} size={16} filled={ok} />
                      {c.label}
                    </li>
                  );
                })}
              </ul>
              <span className="font-caption text-caption text-on-surface-variant">Đây chỉ là gợi ý để mật khẩu mạnh hơn; yêu cầu bắt buộc là tối thiểu {MIN_LENGTH} ký tự.</span>
            </div>
          </div>

          <PasswordInput
            id="xac-nhan-mat-khau"
            label="Xác nhận mật khẩu mới"
            required
            autoComplete="new-password"
            value={xacNhan}
            onChange={(e) => setXacNhan(e.target.value)}
            hint={
              xacNhan ? (
                <span className={`inline-flex items-center gap-space-2xs ${matched ? "text-secondary" : "text-error"}`}>
                  <MaterialIcon name={matched ? "check" : "close"} size={14} />
                  {matched ? "Mật khẩu xác nhận đã trùng khớp" : "Mật khẩu xác nhận chưa khớp"}
                </span>
              ) : undefined
            }
          />

          <div className="rounded-xl bg-primary-fixed/50 p-space-md flex items-start gap-space-md">
            <span className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <MaterialIcon name="shield" size={20} filled />
            </span>
            <p className="m-0 font-caption text-caption text-on-primary-container">
              <strong className="font-caption-bold text-caption-bold">Lưu ý an toàn từ Chợ Đồ Cũ:</strong> mật khẩu nên khác mật khẩu ngân hàng và email của bạn. Ban quản trị
              Chợ Đồ Cũ <strong className="font-caption-bold text-caption-bold">không bao giờ yêu cầu cung cấp mật khẩu hoặc mã OTP</strong> qua điện thoại hay kênh tin nhắn hỗ trợ.
            </p>
          </div>

          {error && <FormAlert message={error} />}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="h-12 px-space-xl rounded-xl border-0 cursor-pointer bg-primary-container hover:bg-primary text-on-primary font-button-text text-button-text shadow-md inline-flex items-center gap-space-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <MaterialIcon name={busy ? "progress_activity" : "shield_lock"} size={18} className={busy ? "animate-spin" : ""} />
              {busy ? "Đang cập nhật…" : "Lưu mật khẩu mới"}
            </button>
          </div>
        </form>
      </Card>
  );
}
