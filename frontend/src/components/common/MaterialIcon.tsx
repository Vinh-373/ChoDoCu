interface Props {
  /** Tên icon trong Material Symbols, ví dụ "location_on". */
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
}

/** Icon font Material Symbols (font nạp trong index.html). Luôn ẩn với trình đọc màn hình. */
export default function MaterialIcon({ name, size = 20, filled = false, className = "" }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size, fontVariationSettings: filled ? "'FILL' 1" : undefined }}
    >
      {name}
    </span>
  );
}
