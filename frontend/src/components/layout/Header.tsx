import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import Icon from "../common/Icon";

export default function Header() {
  const { user, logout, isStaff } = useAuth();
  const { unread } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [q, setQ] = useState("");

  // Đồng bộ ô tìm với từ khoá trên URL khi đang ở trang tìm kiếm.
  useEffect(() => {
    if (location.pathname === "/tim-kiem") setQ(new URLSearchParams(location.search).get("q") ?? "");
  }, [location.pathname, location.search]);

  // Đóng menu người dùng khi đổi trang.
  useEffect(() => {
    menuRef.current?.removeAttribute("open");
  }, [location.pathname]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const keyword = q.trim();
    navigate(keyword ? `/tim-kiem?q=${encodeURIComponent(keyword)}` : "/tim-kiem");
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="Chợ Đồ Cũ – trang chủ">
          <svg className="logo-mark" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#1b4fd8" />
            <path d="M14 32 26 16h26v32H26z" fill="#ffcf33" />
            <circle cx="26" cy="32" r="3.6" fill="#1b4fd8" />
          </svg>
          <span className="hide-sm">Chợ Đồ Cũ</span>
        </Link>

        <form className="header-search" role="search" onSubmit={submit}>
          <span className="icon-left">
            <Icon name="search" size={18} />
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm điện thoại, xe máy, bàn ghế…"
            aria-label="Từ khoá tìm kiếm"
          />
        </form>

        <nav className="header-actions" aria-label="Chức năng chính">
          <NavLink to="/dich-vu" className={({ isActive }) => `nav-link hide-md ${isActive ? "is-active" : ""}`}>
            Gói đẩy tin
          </NavLink>

          {user ? (
            <>
              <Link to="/yeu-thich" className="icon-btn" aria-label="Tin đã lưu" title="Tin đã lưu">
                <Icon name="heart" />
              </Link>
              <Link to="/tin-nhan" className="icon-btn" aria-label="Tin nhắn" title="Tin nhắn">
                <Icon name="chat" />
              </Link>
              <Link
                to="/thong-bao"
                className="icon-btn"
                aria-label={unread > 0 ? `Thông báo, ${unread} chưa đọc` : "Thông báo"}
                title="Thông báo"
              >
                <Icon name="bell" />
                {unread > 0 && <span className="count">{unread > 99 ? "99+" : unread}</span>}
              </Link>
              <Link to="/dang-bai" className="btn btn-sticker btn-sm" style={{ marginInline: 6 }}>
                <Icon name="plus" size={16} /> <span className="hide-sm">Đăng tin</span>
              </Link>
              <details className="user-menu" ref={menuRef}>
                <summary aria-label="Tài khoản">
                  <span className="avatar">{user.hoTen.trim().charAt(0).toUpperCase() || "?"}</span>
                </summary>
                <div className="menu-pop">
                  <div className="who">
                    <strong>{user.hoTen}</strong>
                    <div className="hint">Vai trò: {user.role}</div>
                  </div>
                  {isStaff && (
                    <Link to="/quan-tri">
                      <Icon name="shield" size={18} /> Trang quản trị
                    </Link>
                  )}
                  <Link to="/yeu-thich">
                    <Icon name="heart" size={18} /> Tin đã lưu
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    <Icon name="logout" size={18} /> Đăng xuất
                  </button>
                </div>
              </details>
            </>
          ) : (
            <>
              <Link to="/dang-nhap" className="btn btn-ghost btn-sm">
                Đăng nhập
              </Link>
              <Link to="/dang-ky" className="btn btn-sm hide-sm" style={{ marginLeft: 6 }}>
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
