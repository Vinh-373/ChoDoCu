import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Icon, { type IconName } from "../common/Icon";

interface Item { to: string; label: string; icon: IconName; adminOnly?: boolean; end?: boolean; badge?: string; }

// Danh sách phẳng các trang quản trị đã có route; adminOnly dùng để ẩn mục không thuộc quyền hiện tại.
const items: Item[] = [
  { to: "/quan-tri", label: "Dashboard", icon: "grid", end: true },
  { to: "/quan-tri/duyet-bai", label: "Bài đăng", icon: "image", badge: "Duyệt" },
  { to: "/quan-tri/dich-vu", label: "Gói dịch vụ", icon: "shield", adminOnly: true },
  { to: "/quan-tri/thanh-toan", label: "Giao dịch & Thanh toán", icon: "payments", adminOnly: true },
  { to: "/quan-tri/bao-cao", label: "Báo cáo", icon: "flag", adminOnly: true },
  { to: "/quan-tri/danh-muc", label: "Danh mục", icon: "tag", adminOnly: true },
  { to: "/quan-tri/banner", label: "Banner", icon: "image", adminOnly: true },
];

export default function AdminLayout() {
  const { isAdmin } = useAuth();
  return (
    // Khung quản trị full-width riêng: sidebar điều hướng và vùng nội dung theo route hiện tại.
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Điều hướng quản trị">
        <div className="admin-sidebar-group">
          {/* Danh sách chung, không chia nhóm; các mục Admin-only vẫn tuân theo phân quyền. */}
          {items.filter((item) => !item.adminOnly || isAdmin).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? "is-active" : ""}>
              <Icon name={item.icon} size={17} /><span>{item.label}</span>{item.badge && <small>{item.badge}</small>}
            </NavLink>
          ))}
        </div>
        <div className="admin-sidebar-tip"><Icon name="shield" size={18} /><span><b>Hướng dẫn duyệt</b><small>Kiểm tra nội dung, liên hệ và bằng chứng trước khi xử lý bài đăng.</small></span></div>
      </aside>
      <section className="admin-main"><Outlet /></section>
    </div>
  );
}
