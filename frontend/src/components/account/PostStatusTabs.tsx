import type { TrangThaiBaiDang } from "../../types";

export type PostTabKey = "all" | TrangThaiBaiDang;

const TABS: { key: PostTabKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "DaDuyet", label: "Đang hiển thị" },
  { key: "ChoDuyet", label: "Chờ duyệt" },
  { key: "DaAn", label: "Đã ẩn" },
  { key: "BiTuChoi", label: "Bị từ chối" },
  { key: "DaBan", label: "Đã bán" },
];

interface Props {
  value: PostTabKey;
  counts: Record<PostTabKey, number>;
  onChange: (value: PostTabKey) => void;
}

export default function PostStatusTabs({ value, counts, onChange }: Props) {
  return (
    <div role="tablist" aria-label="Lọc theo trạng thái" className="flex gap-space-lg overflow-x-auto border-b border-surface-variant">
      {TABS.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`shrink-0 -mb-px pb-space-sm px-0 bg-transparent border-0 border-b-2 cursor-pointer inline-flex items-center gap-space-xs font-button-text text-button-text ${
              active ? "border-primary-container text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab.label}
            <span className={`px-space-xs rounded-full font-caption-bold text-caption-bold ${active ? "bg-primary-fixed text-primary" : "bg-surface-container-high"}`}>
              {counts[tab.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
