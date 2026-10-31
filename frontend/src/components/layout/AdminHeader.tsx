import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import MaterialIcon from "../common/MaterialIcon";
import AdminFunctionSearch from "./AdminFunctionSearch";
import Logo from "./Logo";
import UserMenu from "./UserMenu";

/** Header riêng cho Admin/Moderator; giữ các chức năng tìm kiếm, chat, thông báo và menu tài khoản. */
export default function AdminHeader() {
  const { unread } = useNotifications();
  const { user } = useAuth();

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-inner">
        <div className="admin-topbar-brand"><Logo /><span className="admin-topbar-brand-tag">ADMIN PORTAL</span></div>
        <div className="admin-topbar-search"><AdminFunctionSearch /></div>
        <nav className="admin-topbar-actions" aria-label="Tiện ích quản trị">
          <Link to="/tin-nhan" aria-label="Tin nhắn" title="Tin nhắn"><MaterialIcon name="chat" size={19} /></Link>
          <Link to="/thong-bao" aria-label={unread ? `Thông báo, ${unread} chưa đọc` : "Thông báo"} title="Thông báo" className="admin-topbar-notifications">
            <MaterialIcon name="notifications" size={19} />
            {unread > 0 && <span className="admin-notification-badge">{unread > 99 ? "99+" : unread}</span>}
          </Link>
          <div className="admin-topbar-account">
            <span><b>{user?.hoTen ?? "Tài khoản"}</b><small>{user?.role === "Admin" ? "Quản trị viên" : "Nhân viên"}</small></span>
            <UserMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}
