import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Không tìm thấy trang");
  return (
    <div className="state">
      <h1>Không tìm thấy trang này</h1>
      <p>Đường dẫn có thể đã đổi hoặc tin đã bị xoá.</p>
      <Link to="/" className="btn">
        Về trang chủ
      </Link>
    </div>
  );
}
