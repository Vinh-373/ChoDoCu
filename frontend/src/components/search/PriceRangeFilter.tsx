import { useEffect, useState } from "react";

const QUICK_RANGES: { label: string; giaTu?: number; giaDen?: number }[] = [
  { label: "Dưới 1 triệu", giaDen: 1_000_000 },
  { label: "1–5 triệu", giaTu: 1_000_000, giaDen: 5_000_000 },
  { label: "5–15 triệu", giaTu: 5_000_000, giaDen: 15_000_000 },
  { label: "Trên 15 triệu", giaTu: 15_000_000 },
] as const;

const numberFormat = new Intl.NumberFormat("vi-VN");
const digitsOnly = (value: string) => value.replace(/\D/g, "");
const parseAmount = (value: string) => {
  const digits = digitsOnly(value);
  return digits ? Number(digits) : undefined;
};
const formatAmount = (value?: number) => value === undefined ? "" : numberFormat.format(value);

interface Props {
  giaTu?: number;
  giaDen?: number;
  onChange: (range: { giaTu?: number; giaDen?: number }) => void;
}

export default function PriceRangeFilter({ giaTu, giaDen, onChange }: Props) {
  const [minText, setMinText] = useState(formatAmount(giaTu));
  const [maxText, setMaxText] = useState(formatAmount(giaDen));
  const minValue = parseAmount(minText);
  const maxValue = parseAmount(maxText);
  const invalidRange = minValue !== undefined && maxValue !== undefined && minValue > maxValue;

  useEffect(() => {
    setMinText(formatAmount(giaTu));
    setMaxText(formatAmount(giaDen));
  }, [giaTu, giaDen]);

  const commitRange = () => {
    if (!invalidRange) onChange({ giaTu: minValue, giaDen: maxValue });
  };

  const selectRange = (range: { giaTu?: number; giaDen?: number }) => {
    setMinText(formatAmount(range.giaTu));
    setMaxText(formatAmount(range.giaDen));
    onChange(range);
  };

  return (
    <div className="field">
      <span className="label">Khoảng giá</span>
      <div className="grid grid-cols-2 gap-space-sm">
        <label className="sr-only" htmlFor="gia-tu">Giá từ</label>
        <input
          id="gia-tu"
          type="text"
          inputMode="numeric"
          value={minText}
          aria-label="Giá từ"
          aria-invalid={invalidRange}
          onFocus={() => setMinText(digitsOnly(minText))}
          onChange={(event) => setMinText(digitsOnly(event.target.value))}
          onBlur={() => {
            setMinText(formatAmount(minValue));
            commitRange();
          }}
          placeholder="Từ"
        />
        <label className="sr-only" htmlFor="gia-den">Giá đến</label>
        <input
          id="gia-den"
          type="text"
          inputMode="numeric"
          value={maxText}
          aria-label="Giá đến"
          aria-invalid={invalidRange}
          onFocus={() => setMaxText(digitsOnly(maxText))}
          onChange={(event) => setMaxText(digitsOnly(event.target.value))}
          onBlur={() => {
            setMaxText(formatAmount(maxValue));
            commitRange();
          }}
          placeholder="Đến"
        />
      </div>
      {invalidRange && <p className="text-sm text-error">Giá từ phải nhỏ hơn hoặc bằng giá đến.</p>}
      <div className="flex flex-wrap gap-space-xs">
        {QUICK_RANGES.map((range) => {
          const active = giaTu === range.giaTu && giaDen === range.giaDen;
          return (
            <button
              key={range.label}
              type="button"
              className={`rounded-full border px-space-sm py-space-2xs text-caption transition-colors ${
                active
                  ? "border-primary bg-primary-fixed text-on-primary-fixed"
                  : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
              aria-pressed={active}
              onClick={() => selectRange(range)}
            >
              {range.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
