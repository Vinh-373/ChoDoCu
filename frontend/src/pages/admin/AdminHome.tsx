import { Link } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { useAuth } from "../../contexts/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { ErrorBox, Spinner } from "../../components/common/State";

const metrics = [
  { key: "users", label: "Người dùng" },
  { key: "posts", label: "Bài đăng" },
  { key: "transactions", label: "Giao dịch" },
  { key: "reports", label: "Báo cáo bài đăng" },
] as const;

export default function AdminHome() {
  useDocumentTitle("Quản trị");
  const { user, isAdmin } = useAuth();
  const { data, loading, error, reload } = useFetch(() => adminApi.dashboard(), [isAdmin], isAdmin);

  return (
    <div className="stack">
      <div>
        <h1>Xin chào, {user?.hoTen}</h1>
        <p className="muted">Bạn đang đăng nhập với quyền {isAdmin ? "Quản trị viên" : "Kiểm duyệt viên"}.</p>
      </div>

      {loading && !data ? (
        <Spinner />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : data ? (
        <section className="cat-grid" aria-label="Thống kê quản trị">
          {metrics.map((metric) => (
            <article key={metric.key} className="cat-card">
              <p className="muted">{metric.label}</p>
              <strong style={{ display: "block", fontSize: "2rem", marginTop: 8 }}>
                {data[metric.key].toLocaleString("vi-VN")}
              </strong>
            </article>
          ))}
        </section>
      ) : !isAdmin ? (
        <p className="muted">Tài khoản kiểm duyệt viên không có quyền xem thống kê quản trị.</p>
      ) : null}

      <section className="cat-grid" aria-label="Tác vụ quản trị">
        <Link to="/quan-tri/duyet-bai" className="cat-card">
          <h3>Duyệt bài</h3>
          <p className="muted">Mở tin theo mã, xem nội dung rồi duyệt hoặc từ chối.</p>
        </Link>
        {isAdmin && (
          <>
            <Link to="/quan-tri/bao-cao" className="cat-card">
              <h3>Báo cáo bài đăng</h3>
              <p className="muted">Xem báo cáo của người dùng và cập nhật trạng thái xử lý.</p>
            </Link>
            <Link to="/quan-tri/danh-muc" className="cat-card">
              <h3>Danh mục</h3>
              <p className="muted">Tạo, cập nhật trạng thái, sắp xếp cây và xoá danh mục.</p>
            </Link>
            <Link to="/quan-tri/banner" className="cat-card">
              <h3>Banner</h3>
              <p className="muted">Thêm, chỉnh sửa và xoá ảnh banner.</p>
            </Link>
            <Link to="/quan-tri/san-pham" className="cat-card">
              <h3>Sản phẩm</h3>
              <p className="muted">Quản lý danh sách sản phẩm trong danh mục.</p>
            </Link>
            <Link to="/quan-tri/hang" className="cat-card">
              <h3>Hãng</h3>
              <p className="muted">Thêm, sửa và xoá hãng sản phẩm.</p>
            </Link>
            <Link to="/quan-tri/thuoc-tinh" className="cat-card">
              <h3>Thuộc tính sản phẩm</h3>
              <p className="muted">Cấu hình kiểu dữ liệu, giá trị và danh mục áp dụng.</p>
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
