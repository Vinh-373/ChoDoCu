import type { ThongKeQuanTriResponse, TrangThaiBaiDang } from "../../types";

export type AdminPostTab = "all" | TrangThaiBaiDang;

interface Props {
  value: AdminPostTab;
  stats: ThongKeQuanTriResponse | null;
  onChange: (value: AdminPostTab) => void;
}

const TABS: { key: "all" | "ChoDuyet" | "DaDuyet" | "BiTuChoi" | "archived"; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "ChoDuyet", label: "Chờ duyệt" },
  { key: "DaDuyet", label: "Đã duyệt" },
  { key: "BiTuChoi", label: "Bị từ chối" },
  { key: "archived", label: "Đã ẩn / Đã bán" },
];

export default function AdminPostTabs({ value, stats, onChange }: Props) {
  const archived = value === "DaAn" || value === "DaBan";
  const countByTab: Record<(typeof TABS)[number]["key"], number> = {
    all: stats?.tongSo ?? 0,
    ChoDuyet: stats?.choDuyet ?? 0,
    DaDuyet: stats?.daDuyet ?? 0,
    BiTuChoi: stats?.biTuChoi ?? 0,
    archived: (stats?.daAn ?? 0) + (stats?.daBan ?? 0),
  };

  return (
    <div>
      <div role="tablist" aria-label="Lọc tin theo trạng thái" className="flex gap-space-lg overflow-x-auto border-b border-surface-variant">
        {TABS.map((tab) => {
          const active = tab.key === "archived" ? archived : value === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.key === "archived" ? "DaAn" : tab.key)}
              className={`-mb-px inline-flex shrink-0 items-center gap-space-xs border-0 border-b-2 bg-transparent px-0 pb-space-sm font-button-text text-button-text ${
                active ? "border-primary-container text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-space-xs font-caption-bold text-caption-bold ${active ? "bg-primary-fixed text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                {countByTab[tab.key].toLocaleString("vi-VN")}
              </span>
            </button>
          );
        })}
      </div>
      {archived && (
        <div className="flex gap-space-xs pt-space-md" aria-label="Chọn trạng thái lưu trữ">
          {(["DaAn", "DaBan"] as const).map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={value === status}
              onClick={() => onChange(status)}
              className={`rounded-full border px-space-md py-space-xs font-caption-bold text-caption-bold ${
                value === status
                  ? "border-primary bg-primary-fixed text-primary"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {status === "DaAn" ? `Đã ẩn (${stats?.daAn ?? 0})` : `Đã bán (${stats?.daBan ?? 0})`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
