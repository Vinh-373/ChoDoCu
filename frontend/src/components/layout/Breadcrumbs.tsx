import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import MaterialIcon from "../common/MaterialIcon";

interface Segment {
  label: string;
  /** Trang đích khi bấm vào; bỏ trống nếu đoạn này không có trang riêng. */
  to?: string;
}

const SEGMENTS: Record<string, Segment> = {
  "tim-kiem": { label: "Tìm kiếm", to: "/tim-kiem" },
  "bai-dang": { label: "Tin đăng", to: "/tim-kiem" },
  "dich-vu": { label: "Dịch vụ đẩy tin", to: "/dich-vu" },
  "dang-nhap": { label: "Đăng nhập" },
  "dang-ky": { label: "Đăng ký" },
  "dang-bai": { label: "Đăng tin" },
  "yeu-thich": { label: "Tin đã lưu" },
  "thong-bao": { label: "Thông báo" },
  "tin-nhan": { label: "Tin nhắn", to: "/tin-nhan" },
  "quan-tri": { label: "Quản trị", to: "/quan-tri" },
  "duyet-bai": { label: "Duyệt bài" },
  "bao-cao": { label: "Báo cáo vi phạm" },
  "danh-muc": { label: "Danh mục" },
  banner: { label: "Banner" },
};

/** Thanh đường dẫn dưới header, dựng từ URL hiện tại. Trang chủ không hiện. */
export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const crumbs: Segment[] = parts.map((p) => (/^\d+$/.test(p) ? { label: `#${p}` } : (SEGMENTS[p] ?? { label: p })));

  return (
    <nav aria-label="Đường dẫn" className="w-full bg-surface-container-low py-space-xs">
      <ol className="max-w-7xl mx-auto px-margin-desktop m-0 list-none flex items-center gap-space-2xs overflow-x-auto whitespace-nowrap text-on-surface-variant font-caption text-caption">
        <li className="flex items-center gap-space-2xs">
          <Link to="/" className="flex items-center gap-space-2xs text-on-surface-variant hover:text-primary no-underline hover:no-underline transition-colors">
            <MaterialIcon name="home" size={16} className="text-primary" />
            <span>Chợ Đồ Cũ</span>
          </Link>
        </li>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <Fragment key={i}>
              <li aria-hidden="true">/</li>
              <li>
                {last || !c.to ? (
                  <span className={last ? "text-on-surface font-caption-bold text-caption-bold" : ""} aria-current={last ? "page" : undefined}>
                    {c.label}
                  </span>
                ) : (
                  <Link to={c.to} className="text-on-surface-variant hover:text-primary no-underline hover:no-underline transition-colors">
                    {c.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
