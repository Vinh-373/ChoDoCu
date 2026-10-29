import MaterialIcon from "../common/MaterialIcon";

// Nội dung quảng bá nằm ở một chỗ để dễ sửa. Số liệu dưới đây là nội dung mẫu của thiết kế.
const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBa8aCeyVDqcQppbOtzRXviVujMSyHsVsQEKVXZ0-Dug1H-pXZIAsjdL0LvCV4goHWPlGeb44lmEsQzS84I8giiH1WlGLiMS7thyXSkEhiCef4TILugLqTvQUsdMC2Rr4n4pJ7NzklagEPXvuCON4JPHXSyPRl7_QsqLWG61DA7V27UXexGWS8vuTxgFvme434lDzIb0riENbq85OIzY75JCZedywknC3c7Q728QOhFPLMTNyhUWCmCxg";

const FEATURES = [
  { icon: "inventory_2", title: "Quản lý tiện lợi", text: "Theo dõi trạng thái tin đăng, tin nhắn khách hàng tức thì." },
  { icon: "shield_person", title: "Giao dịch an toàn", text: "Định danh người bán chuẩn CCCD, bảo trợ khiếu nại 24/7." },
];

interface Props {
  title: string;
  description: string;
}

function FeatureCard({ icon, title, text }: (typeof FEATURES)[number]) {
  return (
    <div className="bg-on-primary/10 backdrop-blur-sm p-space-md rounded-xl flex flex-col gap-space-2xs transition-all hover:bg-on-primary/15">
      <div className="flex items-center gap-space-2xs text-secondary-container">
        <MaterialIcon name={icon} size={20} />
        <span className="font-headline-3 text-[15px] leading-6 font-semibold text-on-primary">{title}</span>
      </div>
      <p className="m-0 font-caption text-caption text-on-primary/85 leading-relaxed">{text}</p>
    </div>
  );
}

/** Cột trái của trang đăng nhập/đăng ký: thương hiệu + điểm tin cậy. Dưới lg chỉ giữ phần đầu cho gọn. */
export default function AuthShowcase({ title, description }: Props) {
  return (
    <aside className="lg:col-span-5 bg-gradient-to-br from-primary-container via-primary-container to-primary text-on-primary p-space-xl lg:p-space-3xl flex flex-col justify-between relative overflow-hidden">
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-on-primary/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-on-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-space-md">
        <div className="inline-flex items-center gap-space-2xs bg-on-primary/15 backdrop-blur-md px-space-md py-space-xs rounded-full w-fit">
          <MaterialIcon name="verified" size={16} filled className="text-secondary-container" />
          <span className="font-caption-bold text-caption-bold uppercase tracking-wider text-on-primary">Nền tảng thanh lý uy tín số 1 Việt Nam</span>
        </div>
        <h2 className="m-0 font-headline-1 text-headline-1 lg:text-[30px] lg:leading-[38px] font-bold text-on-primary tracking-tight">{title}</h2>
        <p className="m-0 font-body-1 text-body-1 text-on-primary/90 max-w-md">{description}</p>
      </div>

      <div className="relative z-10 my-space-xl hidden lg:flex flex-col gap-space-lg">
        <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-primary-fixed-dim/30 shadow-inner">
          <img
            src={HERO_IMAGE}
            alt="Người bán đang cầm gói hàng và điện thoại trong căn hộ có nội thất cổ điển"
            className="w-full h-full object-cover mix-blend-luminosity opacity-90 transition-transform duration-500 hover:scale-105"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
          <div className="absolute bottom-space-sm left-space-sm right-space-sm flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-2xs bg-surface-container-lowest/90 backdrop-blur-md text-on-surface px-space-sm py-space-2xs rounded-lg shadow-sm">
              <MaterialIcon name="check_circle" size={16} filled className="text-secondary" />
              <span className="font-caption-bold text-caption-bold">100% Tin xác thực</span>
            </div>
            <div className="flex items-center gap-space-2xs bg-surface-container-lowest/90 backdrop-blur-md text-on-surface px-space-sm py-space-2xs rounded-lg shadow-sm">
              <MaterialIcon name="group" size={16} filled className="text-primary" />
              <span className="font-caption-bold text-caption-bold">+1.2M Thành viên</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          {FEATURES.map((f) => (
            <FeatureCard key={f.icon} {...f} />
          ))}
        </div>
      </div>

      <div className="relative z-10 pt-space-md hidden lg:flex items-center gap-space-2xs text-on-primary/80">
        <MaterialIcon name="support_agent" size={18} className="text-secondary-container" />
        <span className="font-caption text-caption">Bảo vệ quyền lợi người mua & giải quyết khiếu nại 24/7</span>
      </div>
    </aside>
  );
}
