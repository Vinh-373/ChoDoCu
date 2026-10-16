import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/** Chặn trang cần đăng nhập; truyền roles để chỉ cho đúng vai trò vào. */
export default function ProtectedRoute({ roles }: { roles?: string[] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/dang-nhap" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
