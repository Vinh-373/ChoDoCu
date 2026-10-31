import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { nguoiDungApi } from "../../api/nguoiDung";
import type { HoSoNguoiDung } from "../../types";
import { getErrorMessage } from "../../utils/error";
import FormAlert from "../auth/FormAlert";
import MaterialIcon from "../common/MaterialIcon";
import { TextInput } from "./FormControls";

const PHONE_RE = /^(0|\+84)\d{9}$/;
const RESEND_SECONDS = 60;

interface Props {
  open: boolean;
  currentPhone: string;
  onClose: () => void;
  onChanged: (hoSo: HoSoNguoiDung) => void;
}

/** Đổi số điện thoại 2 bước: nhập số mới → nhập mã 6 chữ số gửi qua email tài khoản. */
export default function ChangePhoneDialog({ open, currentPhone, onClose, onChanged }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (open) {
      setStep(1);
      setPhone("");
      setCode("");
      setError("");
      setCooldown(0);
    }
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const normalized = phone.replace(/\s/g, "");

  const sendCode = async () => {
    if (!PHONE_RE.test(normalized)) return setError("Số điện thoại không hợp lệ (ví dụ 0912345678).");
    if (normalized === currentPhone) return setError("Số điện thoại mới trùng với số hiện tại.");
    setError("");
    setBusy(true);
    try {
      await nguoiDungApi.yeuCauDoiSoDienThoai(normalized);
      setStep(2);
      setCode("");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err, "Chưa gửi được mã. Vui lòng thử lại."));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // sự kiện submit của React nổi qua portal lên form hồ sơ
    if (step === 1) return sendCode();
    if (!/^\d{6}$/.test(code)) return setError("Mã xác nhận gồm 6 chữ số.");
    setError("");
    setBusy(true);
    try {
      const hoSo = await nguoiDungApi.xacNhanDoiSoDienThoai(normalized, code);
      onChanged(hoSo);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Mã xác nhận không đúng hoặc đã hết hạn."));
    } finally {
      setBusy(false);
    }
  };

  const primary =
    "h-11 px-space-lg rounded-xl border-0 cursor-pointer bg-primary-container hover:bg-primary text-on-primary font-button-text text-button-text inline-flex items-center gap-space-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-space-md bg-black/50" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="doi-sdt-title"
        className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-space-xl shadow-xl flex flex-col gap-space-lg"
      >
        <div className="flex items-start justify-between gap-space-md">
          <div>
            <h2 id="doi-sdt-title" className="m-0 font-headline-2 text-headline-2 text-on-surface">Đổi số điện thoại</h2>
            <p className="m-0 mt-space-2xs font-body-2 text-body-2 text-on-surface-variant">
              {step === 1
                ? "Chúng tôi sẽ gửi mã xác nhận tới email của tài khoản."
                : `Nhập mã 6 chữ số vừa gửi tới email của bạn để đổi sang ${normalized}.`}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="border-0 bg-transparent cursor-pointer text-on-surface-variant hover:text-on-surface">
            <MaterialIcon name="close" size={22} />
          </button>
        </div>

        {step === 1 ? (
          <TextInput
            id="so-dien-thoai-moi"
            label="Số điện thoại mới"
            required
            type="tel"
            inputMode="tel"
            autoFocus
            autoComplete="tel"
            placeholder="0912345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            hint={currentPhone ? `Số hiện tại: ${currentPhone}` : undefined}
          />
        ) : (
          <TextInput
            id="ma-xac-nhan-sdt"
            label="Mã xác nhận"
            required
            inputMode="numeric"
            autoFocus
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            hint={
              cooldown > 0 ? (
                `Chưa nhận được mã? Gửi lại sau ${cooldown} giây.`
              ) : (
                <button type="button" onClick={sendCode} disabled={busy} className="p-0 border-0 bg-transparent cursor-pointer text-primary font-caption-bold text-caption-bold">
                  Gửi lại mã
                </button>
              )
            }
          />
        )}

        {error && <FormAlert message={error} />}

        <div className="flex justify-end gap-space-sm">
          {step === 2 && (
            <button type="button" onClick={() => { setStep(1); setError(""); }} className="h-11 px-space-lg rounded-xl border-0 cursor-pointer bg-surface-container-high hover:bg-surface-variant font-button-text text-button-text text-on-surface">
              Đổi số khác
            </button>
          )}
          <button type="submit" disabled={busy} className={primary}>
            <MaterialIcon name={busy ? "progress_activity" : step === 1 ? "mail" : "check"} size={18} className={busy ? "animate-spin" : ""} />
            {step === 1 ? "Gửi mã qua email" : "Xác nhận đổi số"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
