import { Outlet, useLocation } from "react-router-dom";
import AuthShowcase from "./AuthShowcase";

const COPY = {
  login: {
    title: "Chào mừng trở lại với Chợ Đồ Cũ!",
    description: "Tiếp tục quản lý tin đăng, theo dõi đơn hàng và kết nối với hàng nghìn người mua bán sôi động trên toàn quốc.",
  },
  register: {
    title: "Tham gia Chợ Đồ Cũ ngay hôm nay!",
    description: "Tạo tài khoản để đăng tin, lưu tin yêu thích và nhắn trực tiếp cho người bán.",
  },
};

/**
 * Khung hai cột dùng chung cho /dang-nhap và /dang-ky:
 * trái = AuthShowcase, phải = trang con (form) qua <Outlet />.
 */
export default function AuthLayout() {
  const { pathname } = useLocation();
  const copy = pathname.startsWith("/dang-ky") ? COPY.register : COPY.login;

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-desktop py-space-xl lg:py-space-2xl">
      <div className="w-full bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(153,71,0,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px] lg:min-h-[660px]">
        <AuthShowcase {...copy} />
        <section className="lg:col-span-7 p-space-xl sm:p-space-2xl lg:p-space-3xl flex flex-col justify-center bg-surface-container-lowest">
          <div className="w-full max-w-lg mx-auto flex flex-col gap-space-xl">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
