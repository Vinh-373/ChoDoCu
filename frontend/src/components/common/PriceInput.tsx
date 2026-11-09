import { useState } from "react";
import { docSoTienTiengViet } from "../../utils/format";

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const MAX_DIGITS = 12;

export default function PriceInput({ id, value, onChange, error, required }: Props) {
  const [focused, setFocused] = useState(false);
  const displayValue = focused || !value ? value : new Intl.NumberFormat("vi-VN").format(Number(value));
  const preview = value === "0"
    ? "Miễn phí"
    : value
      ? `= ${new Intl.NumberFormat("vi-VN").format(Number(value))} ₫ · ${docSoTienTiengViet(value)}`
      : "";

  return (
    <div className="flex min-w-0 flex-col gap-space-2xs">
      <label htmlFor={id} className="font-caption-bold text-caption-bold text-on-surface">
        Giá (đồng) {required && <span className="text-error">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={focused ? MAX_DIGITS : undefined}
          required={required}
          value={displayValue}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, MAX_DIGITS);
            onChange(digits);
          }}
          onFocus={(event) => {
            setFocused(true);
            event.target.select();
          }}
          onBlur={() => setFocused(false)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : preview ? `${id}-preview` : undefined}
          className="h-11 w-full rounded-xl border-0 bg-surface-container-low px-space-md pr-12 font-body-2 text-body-2 text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#ff7a00]"
          placeholder="Ví dụ: 1.500.000"
        />
        <span className="pointer-events-none absolute right-space-md top-1/2 -translate-y-1/2 font-caption text-caption text-on-surface-variant">₫</span>
      </div>
      {preview && (
        <p id={`${id}-preview`} className="m-0 font-caption text-caption text-on-surface-variant" aria-live="polite">
          {preview}
        </p>
      )}
      {error && <p id={`${id}-error`} className="m-0 font-caption text-caption text-error" role="alert">{error}</p>}
    </div>
  );
}
