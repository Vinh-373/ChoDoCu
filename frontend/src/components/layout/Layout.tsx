import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  const { pathname } = useLocation();

  // Cuộn lên đầu khi đổi trang (đổi query như phân trang thì giữ nguyên vị trí).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      <main className="container page">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">Chợ Đồ Cũ · Mua bán đồ đã qua sử dụng, gặp đúng người cần.</div>
      </footer>
    </>
  );
}
