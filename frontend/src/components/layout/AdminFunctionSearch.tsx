import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import MaterialIcon from "../common/MaterialIcon";

interface AdminFunction {
  label: string;
  path: string;
  keywords: string;
  adminOnly?: boolean;
}

// Tìm kiếm điều hướng chỉ gồm các route quản trị hiện có; không gọi API dữ liệu User.
const adminFunctions: AdminFunction[] = [
  { label: "Dashboard", path: "/quan-tri", keywords: "tổng quan thống kê trang chủ" },
  { label: "Bài đăng", path: "/quan-tri/duyet-bai", keywords: "duyệt bài tin đăng kiểm duyệt" },
  { label: "Giao dịch & Thanh toán", path: "/quan-tri/thanh-toan", keywords: "giao dịch payment thanh toán doanh thu", adminOnly: true },
  { label: "Gói dịch vụ", path: "/quan-tri/dich-vu", keywords: "dịch vụ giá bán đăng đẩy", adminOnly: true },
  { label: "Báo cáo", path: "/quan-tri/bao-cao", keywords: "vi phạm báo xấu xử lý report", adminOnly: true },
  { label: "Danh mục", path: "/quan-tri/danh-muc", keywords: "phân loại sản phẩm category", adminOnly: true },
  { label: "Banner", path: "/quan-tri/banner", keywords: "quảng cáo hình ảnh", adminOnly: true },
];

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("vi").trim();

/** Ô tìm kiếm riêng của Admin/Moderator, tìm và mở nhanh các chức năng quản trị. */
export default function AdminFunctionSearch() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const normalizedQuery = normalize(query);
  const visibleFunctions = adminFunctions.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return !normalizedQuery || normalize(`${item.label} ${item.keywords}`).includes(normalizedQuery);
  });
  const showResults = focused && normalizedQuery.length > 0;

  const openFirstResult = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (visibleFunctions[0]) {
      navigate(visibleFunctions[0].path);
      setQuery("");
      setFocused(false);
    }
  };

  const openFunction = (path: string) => {
    navigate(path);
    setQuery("");
    setFocused(false);
  };

  return (
    <div className="admin-function-search">
      <form role="search" onSubmit={openFirstResult}>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) setFocused(false);
          }}
          aria-label="Tìm chức năng quản trị"
          aria-expanded={showResults}
          aria-controls="admin-function-search-results"
          placeholder="Tìm chức năng quản trị..."
          autoComplete="off"
        />
        <button type="submit" aria-label="Tìm chức năng">
          <svg className="admin-function-search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.2 4.2" />
          </svg>
        </button>
      </form>
      {showResults && (
        <div className="admin-function-search-results" id="admin-function-search-results" role="listbox" aria-label="Chức năng phù hợp">
          {visibleFunctions.length ? visibleFunctions.map((item) => (
            <button key={item.path} type="button" role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => openFunction(item.path)}>
              <MaterialIcon name="arrow_forward" size={16} />
              <span>{item.label}</span>
            </button>
          )) : <p>Không tìm thấy chức năng phù hợp.</p>}
        </div>
      )}
    </div>
  );
}
