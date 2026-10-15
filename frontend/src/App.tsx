import { Route, Routes } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminApprove from "./pages/admin/AdminApprove";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminHome from "./pages/admin/AdminHome";
import AdminReports from "./pages/admin/AdminReports";
import Favorites from "./pages/account/Favorites";
import Notifications from "./pages/account/Notifications";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ChatPage from "./pages/chat/ChatPage";
import HomePage from "./pages/home/HomePage";
import NotFound from "./pages/NotFound";
import PostCreate from "./pages/post/PostCreate";
import PostDetail from "./pages/post/PostDetail";
import PostSearch from "./pages/post/PostSearch";
import ServicesPage from "./pages/service/ServicesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Công khai */}
        <Route index element={<HomePage />} />
        <Route path="tim-kiem" element={<PostSearch />} />
        <Route path="bai-dang/:id" element={<PostDetail />} />
        <Route path="dich-vu" element={<ServicesPage />} />
        <Route path="dang-nhap" element={<LoginPage />} />
        <Route path="dang-ky" element={<RegisterPage />} />

        {/* Cần đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="dang-bai" element={<PostCreate />} />
          <Route path="yeu-thich" element={<Favorites />} />
          <Route path="thong-bao" element={<Notifications />} />
          <Route path="tin-nhan" element={<ChatPage />} />
          <Route path="tin-nhan/:idHoiThoai" element={<ChatPage />} />
        </Route>

        {/* Quản trị: Admin + Moderator vào được khu vực này, từng trang con tự giới hạn theo quyền của BE */}
        <Route element={<ProtectedRoute roles={["Admin", "Moderator"]} />}>
          <Route path="quan-tri" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="duyet-bai" element={<AdminApprove />} />
            <Route element={<ProtectedRoute roles={["Admin"]} />}>
              <Route path="bao-cao" element={<AdminReports />} />
              <Route path="danh-muc" element={<AdminCategories />} />
              <Route path="banner" element={<AdminBanners />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
