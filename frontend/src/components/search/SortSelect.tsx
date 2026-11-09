export type SearchSort = "uuTien" | "moiNhat" | "giaTang" | "giaGiam" | "xemNhieu";

const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "uuTien", label: "Phù hợp nhất" },
  { value: "moiNhat", label: "Mới nhất" },
  { value: "giaTang", label: "Giá thấp đến cao" },
  { value: "giaGiam", label: "Giá cao đến thấp" },
  { value: "xemNhieu", label: "Xem nhiều" },
];

interface Props {
  value: SearchSort;
  onChange: (value: SearchSort) => void;
}

export default function SortSelect({ value, onChange }: Props) {
  return (
    <label className="flex items-center gap-space-sm text-body-2 text-on-surface-variant">
      <span className="whitespace-nowrap">Sắp xếp</span>
      <select
        aria-label="Sắp xếp kết quả"
        className="!min-h-9 !w-auto !py-space-2xs"
        value={value}
        onChange={(event) => onChange(event.target.value as SearchSort)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
