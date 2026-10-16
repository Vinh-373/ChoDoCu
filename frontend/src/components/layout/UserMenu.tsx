import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import MaterialIcon from "../common/MaterialIcon";

const itemClass =
  "flex w-full items-center gap-space-sm px-space-md py-space-sm rounded-lg text-left bg-transparent border-0 cursor-pointer no-underline hover:no-underline font-body-2 text-body-2 text-on-surface hover:bg-surface-container-low";

/** Avatar góc phải: chưa đăng nhập → link tới trang đăng nhập; đã đăng nhập → menu tài khoản. */
export default function UserMenu() {
  const { user, logout, isStaff } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const ref = useRef<HTMLDetailsElement>(null);

  // Đóng menu khi đổi trang hoặc bấm ra ngoài.
  useEffect(() => {
    ref.current?.removeAttribute("open");
  }, [pathname]);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) ref.current.removeAttribute("open");
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  if (!user) {
    return (
      <Link
        to="/dang-nhap"
        aria-label="Đăng nhập"
        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary hover:bg-on-primary-fixed-variant transition-colors"
      >
        <MaterialIcon name="person" size={20} />
      </Link>
    );
  }

  return (
    <details ref={ref} className="relative shrink-0">
      <summary
        aria-label="Tài khoản"
        className="list-none cursor-pointer w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-button-text text-button-text [&::-webkit-details-marker]:hidden"
      >
        {user.hoTen.trim().charAt(0).toUpperCase() || "?"}
      </summary>
      <div className="absolute right-0 top-full mt-space-sm w-64 p-space-sm bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50">
        <div className="px-space-md pt-space-xs pb-space-sm mb-space-xs border-b border-surface-variant">
          <strong className="block font-button-text text-button-text text-on-surface truncate">{user.hoTen}</strong>
          <span className="font-caption text-caption text-on-surface-variant">Vai trò: {user.role}</span>
        </div>
        {isStaff && (
          <Link to="/quan-tri" className={itemClass}>
            <MaterialIcon name="admin_panel_settings" size={20} /> Trang quản trị
          </Link>
        )}
        <Link to="/yeu-thich" className={itemClass}>
          <MaterialIcon name="favorite" size={20} /> Tin đã lưu
        </Link>
        {/* Các lối tắt bị ẩn khỏi thanh nav ở màn hình nhỏ thì nằm trong menu này. */}
        <Link to="/tin-nhan" className={`${itemClass} sm:hidden`}>
          <MaterialIcon name="chat" size={20} /> Tin nhắn
        </Link>
        <Link to="/dich-vu" className={`${itemClass} lg:hidden`}>
          <MaterialIcon name="rocket_launch" size={20} /> Dịch vụ đẩy tin
        </Link>
        <button
          type="button"
          className={itemClass}
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <MaterialIcon name="logout" size={20} /> Đăng xuất
        </button>
      </div>
    </details>
  );
}
