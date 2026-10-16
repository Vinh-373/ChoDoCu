import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function AdminHome() {
  useDocumentTitle("Quản trị");
  const { user, isAdmin } = useAuth();
  return (
    <div className="stack">
      <h1>Xin chào, {user?.hoTen}</h1>
      <p className="muted">Bạn đang đăng nhập với quyền {isAdmin ? "Quản trị viên" : "Kiểm duyệt viên"}.</p>
      <div className="cat-grid">
        <Link to="/quan-tri/duyet-bai" className="cat-card">
          <h3>Duyệt bài</h3>
          <p className="muted">Mở tin theo mã, xem nội dung rồi duyệt hoặc từ chối.</p>
        </Link>
        {isAdmin && (
          <>
            <Link to="/quan-tri/bao-cao" className="cat-card">
              <h3>Báo cáo vi phạm</h3>
              <p className="muted">Xem báo cáo của người dùng và đánh dấu đã xử lý.</p>
            </Link>
            <Link to="/quan-tri/danh-muc" className="cat-card">
              <h3>Danh mục</h3>
              <p className="muted">Thêm, đổi tên, ẩn hoặc xoá danh mục.</p>
            </Link>
            <Link to="/quan-tri/banner" className="cat-card">
              <h3>Banner</h3>
              <p className="muted">Quản lý ảnh banner trên trang chủ.</p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
