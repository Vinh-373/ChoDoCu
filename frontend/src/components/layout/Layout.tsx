import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import AdminHeader from "./AdminHeader";

/** Khung ứng dụng: Admin/Moderator dùng header riêng và không có footer; các trang User giữ nguyên khung chung. */
export default function Layout() {
  const { pathname } = useLocation();
  const isAdminArea = pathname === "/quan-tri" || pathname.startsWith("/quan-tri/");

  // Cuộn lên đầu khi đổi trang (đổi query như phân trang thì giữ nguyên vị trí).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body-1 text-on-surface antialiased">
      {isAdminArea ? <AdminHeader /> : <Header />}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      {!isAdminArea && <Footer />}
    </div>
  );
}
