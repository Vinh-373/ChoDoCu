import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

/** Ô nhập mã OTP: mỗi chữ số một ô, tự nhảy ô, hỗ trợ dán cả mã và phím Backspace. */
export default function OtpInput({ value, onChange, length = 6, disabled }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[Math.max(0, Math.min(i, length - 1))]?.focus();

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) {
      onChange(value.slice(0, i) + value.slice(i + 1));
      return;
    }
    const next = (value.slice(0, i) + digit + value.slice(i + 1)).slice(0, length);
    onChange(next);
    focus(next.length); // sang ô trống kế tiếp
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      e.preventDefault();
      onChange(value.slice(0, i - 1) + value.slice(i));
      focus(i - 1);
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    onChange(text);
    focus(text.length);
  };

  return (
    <div className="flex justify-center gap-space-sm" role="group" aria-label={`Mã xác thực ${length} chữ số`}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Chữ số thứ ${i + 1}`}
          disabled={disabled}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-11 h-14 sm:w-12 p-0 text-center font-headline-2 text-headline-2 text-on-surface bg-surface-container-low border border-outline-variant rounded-lg transition-all focus:outline-none focus:bg-white focus:border-primary-container focus:shadow-[0_0_0_2px_#ff7a00] disabled:opacity-60"
        />
      ))}
    </div>
  );
}
