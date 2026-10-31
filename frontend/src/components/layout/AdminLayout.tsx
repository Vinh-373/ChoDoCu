import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Icon, { type IconName } from "../common/Icon";

interface Item {
  to: string;
  label: string;
  icon: IconName;
  adminOnly?: boolean;
  end?: boolean;
}

const items: Item[] = [
  { to: "/quan-tri", label: "Tổng quan", icon: "grid", end: true },
  { to: "/quan-tri/duyet-bai", label: "Duyệt bài", icon: "check" },
  { to: "/quan-tri/bao-cao", label: "Báo cáo bài đăng", icon: "flag", adminOnly: true },
  { to: "/quan-tri/danh-muc", label: "Danh mục", icon: "tag", adminOnly: true },
  { to: "/quan-tri/banner", label: "Banner", icon: "image", adminOnly: true },
  { to: "/quan-tri/san-pham", label: "Sản phẩm", icon: "grid", adminOnly: true },
  { to: "/quan-tri/hang", label: "Hãng", icon: "tag", adminOnly: true },
  { to: "/quan-tri/thuoc-tinh", label: "Thuộc tính sản phẩm", icon: "edit", adminOnly: true },
];

export default function AdminLayout() {
  const { isAdmin } = useAuth();
  return (
    <div className="admin">
      <nav className="admin-nav" aria-label="Quản trị">
        {items
          .filter((i) => !i.adminOnly || isAdmin)
          .map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => (isActive ? "is-active" : "")}>
              <Icon name={i.icon} size={18} /> {i.label}
            </NavLink>
          ))}
      </nav>
      <section>
        <Outlet />
      </section>
    </div>
  );
}
