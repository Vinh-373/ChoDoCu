import Icon from "./Icon";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  // Hiện tối đa 5 số trang quanh trang hiện tại.
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Trang trước">
        <Icon name="left" size={18} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={p === page ? "is-current" : ""}
          aria-current={p === page ? "page" : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Trang sau">
        <Icon name="right" size={18} />
      </button>
    </nav>
  );
}
