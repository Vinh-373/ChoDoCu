const vnd = new Intl.NumberFormat("vi-VN");

export const formatPrice = (n: number) => (n === 0 ? "Miễn phí" : `${vnd.format(n)} đ`);

export function formatDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
}

/** "5 phút trước", "2 ngày trước"... */
export function timeAgo(value?: string | null): string {
  if (!value) return "";
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return "Vừa xong";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return formatDate(value);
}

export const TRANG_THAI_BAI_DANG: Record<string, string> = {
  ChoDuyet: "Chờ duyệt",
  DaDuyet: "Đã duyệt",
  TuChoi: "Từ chối",
  DaAn: "Đã ẩn",
};
