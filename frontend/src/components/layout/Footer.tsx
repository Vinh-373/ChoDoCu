import type { MouseEvent, ReactNode } from "react";
import MaterialIcon from "../common/MaterialIcon";

/** Liên kết giữ chỗ cho các trang chưa có (chính sách, trợ giúp…). Thay bằng <Link> khi có trang. */
function PlaceholderLink({ children }: { children: ReactNode }) {
  return (
    <a href="#" onClick={(e: MouseEvent) => e.preventDefault()} className="text-on-surface-variant hover:text-primary no-underline hover:no-underline transition-colors">
      {children}
    </a>
  );
}

const SUPPORT = ["Trung tâm trợ giúp", "Quy tắc mua bán an toàn", "Chính sách bảo hành & đổi trả", "Quy chế hoạt động sàn"];
const ABOUT = ["Giới thiệu nền tảng", "Quy chế giải quyết khiếu nại", "Chính sách bảo mật thông tin", "Liên hệ truyền thông đối tác"];

function LinkColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-space-sm">
      <h4 className="font-button-text text-button-text text-on-surface font-semibold">{title}</h4>
      <ul className="m-0 p-0 list-none flex flex-col gap-space-xs font-body-2 text-body-2">
        {items.map((t) => (
          <li key={t}>
            <PlaceholderLink>{t}</PlaceholderLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest mt-space-3xl shadow-[0_-1px_6px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-margin-desktop py-space-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop">
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <MaterialIcon name="recycling" size={28} className="text-primary" />
              <span className="font-headline-3 text-headline-3 text-primary font-bold">Chợ Đồ Cũ</span>
            </div>
            <p className="font-body-2 text-body-2 text-on-surface-variant">
              Sàn thương mại điện tử chuyên đồ đã qua sử dụng, kết nối người mua và người bán minh bạch, an toàn và thuận tiện hàng đầu Việt Nam.
            </p>
            <div className="flex items-center gap-space-sm pt-space-xs">
              <MaterialIcon name="verified_user" size={20} className="text-secondary" />
              <span className="font-caption-bold text-caption-bold text-secondary">Bảo chứng giao dịch uy tín</span>
            </div>
          </div>

          <LinkColumn title="Hỗ trợ khách hàng" items={SUPPORT} />
          <LinkColumn title="Về Chợ Đồ Cũ" items={ABOUT} />

          <div className="flex flex-col gap-space-sm">
            <h4 className="font-button-text text-button-text text-on-surface font-semibold">Tổng đài trợ giúp</h4>
            <div className="flex items-center gap-space-xs">
              <MaterialIcon name="call" size={20} className="text-primary-container" />
              <span className="font-price-md text-price-md text-primary">1900 6868 (8h - 21h)</span>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant font-caption text-caption">
              <MaterialIcon name="mail" size={16} />
              <span>hotro@chodocu.vn</span>
            </div>
            <p className="pt-space-xs font-caption text-caption text-on-surface-variant">
              Văn phòng đại diện: Tòa nhà Sài Gòn Centre, Quận 1, TP. Hồ Chí Minh
            </p>
          </div>
        </div>

        <div className="mt-space-2xl pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant font-caption text-caption">
          <p>© {new Date().getFullYear()} Chợ Đồ Cũ Platform. Toàn quyền sở hữu bản quyền nội dung.</p>
          <p>Giấy phép MXH số 334/GP-BTTTT do Bộ Thông tin và Truyền thông cấp ngày 15/08/2021.</p>
        </div>
      </div>
    </footer>
  );
}
