import MaterialIcon from "../common/MaterialIcon";
import type { ThongKeQuanTriResponse } from "../../types";

interface Props {
  stats: ThongKeQuanTriResponse | null;
  loading: boolean;
}

export default function AdminPostStats({ stats, loading }: Props) {
  const cards = [
    { label: "Tổng bài đăng", value: stats?.tongSo, note: stats ? `+${stats.moiHomNay} tin mới hôm nay` : "", icon: "inventory_2", accent: "text-primary" },
    { label: "Chờ kiểm duyệt", value: stats?.choDuyet, note: "Cần được xử lý", icon: "pending_actions", accent: "text-tertiary" },
    { label: "Đã duyệt", value: stats?.daDuyet, note: "Tin đang hiển thị", icon: "check_circle", accent: "text-secondary" },
    { label: "Bị từ chối", value: stats?.biTuChoi, note: "Tin không được duyệt", icon: "cancel", accent: "text-error" },
  ];

  return (
    <section className="grid grid-cols-1 gap-space-lg sm:grid-cols-2 xl:grid-cols-4" aria-label="Thống kê tin đăng">
      {cards.map((card, index) => (
        <article
          key={card.label}
          className={`rounded-xl border p-space-lg ${index === 1 ? "border-tertiary-container bg-tertiary-fixed/40" : "border-outline-variant bg-surface-container-lowest"}`}
        >
          <div className="flex items-start justify-between gap-space-sm">
            <div>
              <p className="m-0 text-body-2 text-on-surface-variant">{card.label}</p>
              <p className="mb-0 mt-space-xs font-headline-1 text-headline-1 text-on-surface" aria-live="polite">
                {loading && card.value === undefined ? "—" : (card.value ?? 0).toLocaleString("vi-VN")}
              </p>
            </div>
            <span className={`rounded-lg bg-surface-container-low p-space-sm ${card.accent}`}>
              <MaterialIcon name={card.icon} size={22} />
            </span>
          </div>
          <p className="mb-0 mt-space-sm text-caption text-on-surface-variant">
            {card.note || (loading ? "Đang tải thống kê…" : "Chưa có dữ liệu")}
          </p>
        </article>
      ))}
    </section>
  );
}
