import { Link } from "react-router-dom";
import MaterialIcon from "../common/MaterialIcon";

/** Nút "Đăng tin" nổi bật. Chưa đăng nhập thì ProtectedRoute tự chuyển sang trang đăng nhập. */
export default function PostAdButton() {
  return (
    <Link
      to="/dang-bai"
      className="h-11 px-space-lg bg-primary-container text-on-primary font-button-text text-button-text rounded-xl hover:bg-primary hover:no-underline no-underline transition-colors flex items-center justify-center gap-space-xs shadow-md shrink-0"
    >
      <MaterialIcon name="add_circle" size={22} />
      <span className="hidden sm:inline tracking-wide uppercase font-bold">Đăng tin</span>
    </Link>
  );
}
