const vnd = new Intl.NumberFormat("vi-VN");

export const formatGia = (gia: number) => `${vnd.format(gia)} ₫`;

export const formatPrice = (n: number) => (n === 0 ? "Miễn phí" : `${vnd.format(n)} đ`);

const numberWords = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const amountUnits = ["", "nghìn", "triệu", "tỷ"];

function readThreeDigits(value: number, includeHundreds: boolean): string {
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const units = value % 10;
  const words: string[] = [];

  if (hundreds > 0 || includeHundreds) words.push(`${numberWords[hundreds]} trăm`);
  if (tens > 1) {
    words.push(`${numberWords[tens]} mươi`);
    if (units === 1) words.push("mốt");
    else if (units === 5) words.push("lăm");
    else if (units > 0) words.push(numberWords[units]);
  } else if (tens === 1) {
    words.push("mười");
    if (units === 5) words.push("lăm");
    else if (units > 0) words.push(numberWords[units]);
  } else if (units > 0) {
    if (hundreds > 0 || includeHundreds) words.push("lẻ");
    words.push(numberWords[units]);
  }

  return words.join(" ");
}

export function docSoTienTiengViet(value: string | number): string {
  const digits = String(value).replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits || digits === "0") return "Miễn phí";
  if (digits.length > 12) throw new RangeError("Số tiền không được vượt quá 999.999.999.999 đồng.");

  const groups: number[] = [];
  for (let end = digits.length; end > 0; end -= 3) {
    groups.push(Number(digits.slice(Math.max(0, end - 3), end)));
  }
  const highestGroup = groups.findIndex((group) => group > 0);
  const words: string[] = [];

  for (let index = groups.length - 1; index >= 0; index -= 1) {
    const group = groups[index];
    if (group === 0) continue;
    words.push(readThreeDigits(group, index < highestGroup));
    if (amountUnits[index]) words.push(amountUnits[index]);
  }

  const amount = words.join(" ");
  return `${amount.charAt(0).toLocaleUpperCase("vi-VN")}${amount.slice(1)} đồng`;
}

export function formatDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export const formatNgay = formatDate;

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
  DaDuyet: "Đang hiển thị",
  BiTuChoi: "Bị từ chối",
  DaAn: "Đã ẩn",
  DaBan: "Đã bán",
};

export const TRANG_THAI_BAI_DANG_BADGE: Record<string, { badge: string; dot: string }> = {
  ChoDuyet: { badge: "bg-tertiary-fixed text-on-tertiary-fixed-variant", dot: "bg-tertiary-container" },
  DaDuyet: { badge: "bg-secondary-container/50 text-on-secondary-container", dot: "bg-secondary" },
  BiTuChoi: { badge: "bg-error-container text-on-error-container", dot: "bg-error" },
  DaAn: { badge: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" },
  DaBan: { badge: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" },
};
