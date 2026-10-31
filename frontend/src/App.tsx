import { Route, Routes } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import AuthLayout from "./components/auth/AuthLayout";
import ContainerLayout from "./components/layout/ContainerLayout";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminApprove from "./pages/admin/AdminApprove";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminHome from "./pages/admin/AdminHome";
import AdminReports from "./pages/admin/AdminReports";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminAttributes from "./pages/admin/AdminAttributes";
import Favorites from "./pages/account/Favorites";
import Notifications from "./pages/account/Notifications";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ChatPage from "./pages/chat/ChatPage";
import HomePage from "./pages/home/HomePage";
import NotFound from "./pages/NotFound";
import PostCreate from "./pages/post/PostCreate";
import PostDetail from "./pages/post/PostDetail";
import PostSearch from "./pages/post/PostSearch";
import ServicesPage from "./pages/service/ServicesPage";
import ProfilePage from "./pages/account/ProfilePage";
import MyPosts from "./pages/account/MyPosts";
import ChangePassword from "./pages/account/ChangePassword";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Đăng nhập / đăng ký: khung hai cột riêng, rộng tối đa 7xl */}
        <Route element={<AuthLayout />}>
          <Route path="dang-nhap" element={<LoginPage />} />
          <Route path="dang-ky" element={<RegisterPage />} />
        </Route>
          <Route path="quen-mat-khau" element={<ForgotPasswordPage />} />

        {/* Các trang còn lại: khung .container */}
        <Route element={<ContainerLayout />}>
          {/* Công khai */}
          <Route index element={<HomePage />} />
          <Route path="tim-kiem" element={<PostSearch />} />
          <Route path="bai-dang/:id" element={<PostDetail />} />
          <Route path="dich-vu" element={<ServicesPage />} />

          {/* Cần đăng nhập */}
          <Route element={<ProtectedRoute />}>
            <Route path="tai-khoan/ho-so" element={<ProfilePage />} />
            <Route path="tai-khoan/quan-ly-tin" element={<MyPosts />} />
            <Route path="tai-khoan/doi-mat-khau" element={<ChangePassword />} />
            <Route path="dang-bai" element={<PostCreate />} />
            <Route path="tai-khoan/yeu-thich" element={<Favorites />} />
            <Route path="thong-bao" element={<Notifications />} />
            <Route path="tin-nhan" element={<ChatPage />} />
            <Route path="tin-nhan/:idHoiThoai" element={<ChatPage />} />
          </Route>

          {/* Quản trị: Admin và Moderator; riêng báo cáo/danh mục/banner chỉ Admin */}
          <Route element={<ProtectedRoute roles={["Admin", "Moderator"]} />}>
            <Route path="quan-tri" element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="duyet-bai" element={<AdminApprove />} />
              <Route element={<ProtectedRoute roles={["Admin"]} />}>
                <Route path="bao-cao" element={<AdminReports />} />
                <Route path="danh-muc" element={<AdminCategories />} />
                <Route path="banner" element={<AdminBanners />} />
                <Route path="san-pham" element={<AdminProducts />} />
                <Route path="hang" element={<AdminBrands />} />
                <Route path="thuoc-tinh" element={<AdminAttributes />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
