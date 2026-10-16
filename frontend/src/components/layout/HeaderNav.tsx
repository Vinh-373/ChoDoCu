import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import MaterialIcon from "../common/MaterialIcon";

interface ItemProps {
  to: string;
  icon: string;
  label: string;
  badge?: number;
  className?: string;
}

function NavItem({ to, icon, label, badge = 0, className = "" }: ItemProps) {
  return (
    <NavLink
      to={to}
      title={label}
      aria-label={badge > 0 ? `${label}, ${badge} chưa đọc` : label}
      className={({ isActive }) =>
        `relative items-center gap-space-2xs px-space-md py-space-sm rounded-lg no-underline hover:no-underline transition-colors font-button-text text-button-text ${
          isActive ? "bg-surface-container text-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
        } ${className || "flex"}`
      }
    >
      <MaterialIcon name={icon} size={20} />
      <span className="hidden 2xl:inline">{label}</span>
      {badge > 0 && (
        <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-on-error text-[11px] font-bold leading-[18px] text-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </NavLink>
  );
}

/** Các lối tắt trên header. Dưới màn hình 2xl (1536px) chỉ hiện icon (có tooltip + aria-label). */
export default function HeaderNav() {
  const { user } = useAuth();
  const { unread } = useNotifications();

  return (
    <nav className="flex items-center gap-space-xs" aria-label="Chức năng chính">
      <NavItem to="/dich-vu" icon="rocket_launch" label="Dịch vụ" className="hidden lg:flex" />
      {user ? (
        <>
          <NavItem to="/yeu-thich" icon="favorite" label="Tin đã lưu" className="hidden sm:flex" />
          <NavItem to="/tin-nhan" icon="chat" label="Chat" className="hidden sm:flex" />
          <NavItem to="/thong-bao" icon="notifications" label="Thông báo" badge={unread} />
        </>
      ) : (
        <NavItem to="/dang-nhap" icon="account_circle" label="Đăng nhập" />
      )}
    </nav>
  );
}
