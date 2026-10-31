// useEffect tải số liệu sau khi dashboard hiển thị; useState giữ dữ liệu API và trạng thái tải.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { baoCaoApi } from "../../api/baoCao";
import { baiDangApi } from "../../api/baiDang";
import client from "../../api/client";
import Icon from "../../components/common/Icon";
import { useAuth } from "../../contexts/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { PagedResult } from "../../types";

// Chỉ cần định nghĩa một trường tối thiểu để axios đọc totalCount từ API danh sách người dùng.
interface UserListItem { id: number; }
interface DashboardStats { posts: number | null; users: number | null; reports: number | null; }

// DỮ LIỆU GIẢ: số bài đăng theo ngày hiện chỉ phục vụ vẽ biểu đồ.
// Cần API thống kê theo khoảng ngày, ví dụ GET /api/admin/dashboard?from=...&to=..., trả về postCountByDay.
const sampleTrend = [
  { day: "T2", value: 29 }, { day: "T3", value: 39 }, { day: "T4", value: 31 },
  { day: "T5", value: 57 }, { day: "T6", value: 46 }, { day: "T7", value: 76 }, { day: "CN", value: 64 },
];
// DỮ LIỆU GIẢ: tỷ trọng và tên danh mục không được tính từ dữ liệu bài đăng hiện tại.
// Cần endpoint trả về số lượng bài theo danh mục, ví dụ GET /api/admin/dashboard/categories.
const sampleCategories = [
  { label: "Điện tử & Công nghệ", count: "38%", color: "#ff6b00" },
  { label: "Xe cộ & Phụ tùng", count: "26%", color: "#a56800" },
  { label: "Đồ gia dụng & Nội thất", count: "20%", color: "#087a4b" },
  { label: "Thời trang & Phụ kiện", count: "16%", color: "#ffae83" },
];
// DỮ LIỆU GIẢ: backend chỉ cho người dùng xem lịch sử giao dịch của chính họ, chưa có danh sách giao dịch quản trị.
// Cần API admin trả mã giao dịch, tên sản phẩm/dịch vụ, số tiền, thời điểm và trạng thái.
const sampleTransactions = [
  { name: "Honda SH 150i ABS", code: "GD-1048", amount: "24.800.000 đ", change: "+18%" },
  { name: "Yamaha NVX 155", code: "GD-1047", amount: "18.400.000 đ", change: "+12%" },
  { name: "Air Blade 160", code: "GD-1046", amount: "16.900.000 đ", change: "+6%" },
  { name: "Vision 110", code: "GD-1045", amount: "10.500.000 đ", change: "+2%" },
];
// DỮ LIỆU GIẢ: chưa có API nhật ký kiểm duyệt hoặc danh sách bài đăng chờ duyệt.
// Cần API có phân trang, thời gian, nội dung, người xử lý và trạng thái của từng hoạt động kiểm duyệt.
const sampleActivity = [
  { icon: "check", title: "Báo cáo giả định · 35 phút trước", detail: "Honda SH 150i bị báo cáo", status: "Đã xử lý", tone: "green" },
  { icon: "flag", title: "Báo cáo giả định · 2 giờ trước", detail: "Người bán đăng nội dung chưa phù hợp", status: "Đang xử lý", tone: "orange" },
  { icon: "shield", title: "Bài đăng giả định · 3 giờ trước", detail: "Phát hiện hình ảnh trùng lặp cần kiểm tra", status: "Chờ xử lý", tone: "red" },
  { icon: "check", title: "Bài đăng giả định · 4 giờ trước", detail: "Bài đăng đã được duyệt", status: "Đã duyệt", tone: "green" },
];

// Định dạng số theo tiếng Việt; dấu gạch ngang thể hiện API chưa trả được dữ liệu.
const number = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("vi-VN").format(value);

export default function AdminHome() {
  // Cập nhật tiêu đề tab và lấy thông tin tài khoản/role cho các liên kết phù hợp quyền.
  useDocumentTitle("Tổng quan quản trị");
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ posts: null, users: null, reports: null });
  const [loading, setLoading] = useState(true);

  // Ba số liệu khả dụng lấy từ API thật:
  // - GET /api/bai-dang: totalCount là tổng tin đã duyệt (API tìm kiếm chỉ trả DaDuyet).
  // - GET /api/nguoi-dung: totalCount là tổng người dùng, cần quyền NguoiDung.Xem.
  // - GET /api/bao-cao?trangThai=ChoXuLy: totalCount báo cáo đang chờ, cần quyền BaoCao.XuLy.
  // Promise.allSettled cho phép một API lỗi thì các chỉ số khác vẫn được hiển thị.
  // `active` ngăn cập nhật state sau khi component đã rời trang.
  useEffect(() => {
    let active = true;
    const load = async () => {
      const results = await Promise.allSettled([
        baiDangApi.tim({ page: 1, pageSize: 1 }),
        client.get<PagedResult<UserListItem>>("/nguoi-dung", { params: { page: 1, pageSize: 1 } }).then((r) => r.data),
        baoCaoApi.danhSach("ChoXuLy", 1, 1),
      ]);
      if (!active) return;
      setStats({
        posts: results[0].status === "fulfilled" ? results[0].value.totalCount : null,
        users: results[1].status === "fulfilled" ? results[1].value.totalCount : null,
        reports: results[2].status === "fulfilled" ? results[2].value.totalCount : null,
      });
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, []);

  // Thẻ doanh thu là dữ liệu giả: cần API tổng hợp thanh toán thành công theo mốc thời gian,
  // ví dụ GET /api/admin/dashboard/revenue?from=...&to=...; hiện API thanh toán không có truy vấn admin.
  // Ba thẻ còn lại dùng tổng số từ API; null hiển thị “—” khi gọi lỗi.
  const cards = [
    { title: "Doanh thu", value: "1.248.000.000 đ", note: "Số liệu minh họa", icon: "₫", tone: "orange" },
    { title: "Bài đăng đã duyệt", value: loading ? "…" : number(stats.posts), note: "Dữ liệu từ hệ thống", icon: "▤", tone: "green" },
    { title: "Người dùng", value: loading ? "…" : number(stats.users), note: "Dữ liệu từ hệ thống", icon: "♙", tone: "yellow" },
    { title: "Báo cáo chờ xử lý", value: loading ? "…" : number(stats.reports), note: "Dữ liệu từ hệ thống", icon: "!", tone: "red" },
  ];

  return (
    <div className="admin-dashboard">
      {/* Tiêu đề dashboard và bộ chọn thời gian theo mẫu. Bộ chọn hiện là phần trình bày; để lọc thật,
          cần nối lựa chọn ngày vào API dashboard thống kê theo khoảng thời gian. */}
      <div className="admin-dashboard-heading">
        <div>
          <span className="admin-eyebrow">HỆ THỐNG V2.4 · Cập nhật theo dữ liệu hiện có</span>
          <h1 className="admin-page-title">Dashboard Admin Chợ Đồ Cũ</h1>
          <p>Theo dõi hoạt động và xử lý công việc của sàn trong một giao diện.</p>
        </div>
        <div className="admin-dashboard-actions">
          <span>Hôm nay</span><span className="is-selected">Tuần này</span><span>Tháng này</span>
          <button type="button" className="btn btn-sm" onClick={() => window.print()}>Xuất báo cáo</button>
        </div>
      </div>

      {/* Các chỉ số tổng quan: doanh thu giả lập, tin/người dùng/báo cáo lấy từ backend. */}
      <div className="admin-metric-grid">
        {cards.map((card) => (
          <article className="admin-metric-card" key={card.title}>
            <div className="admin-metric-top"><span>{card.title}</span><span className={`admin-metric-icon ${card.tone}`}>{card.icon}</span></div>
            <strong>{card.value}</strong><small>{card.note}</small>
          </article>
        ))}
      </div>

      {/* Hàng biểu đồ: đường xu hướng và phân bố danh mục đều là mẫu vì chưa có API thống kê tương ứng. */}
      <div className="admin-dashboard-grid admin-dashboard-grid-main">
        <section className="admin-widget admin-trend-widget">
          <div className="admin-widget-heading"><div><h2>Xu hướng hoạt động sàn</h2><p>Dữ liệu minh họa · Bài đăng trong 7 ngày gần nhất</p></div><span className="admin-demo-tag">Minh họa</span></div>
          <div className="admin-chart" role="img" aria-label="Biểu đồ minh họa xu hướng bài đăng trong tuần">
            <div className="admin-chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
            <div className="admin-chart-plot">
              <div className="admin-chart-gridlines"><i /><i /><i /><i /><i /></div>
              <div className="admin-chart-bars">{sampleTrend.map((item) => <div className="admin-chart-bar-wrap" key={item.day}><div className="admin-chart-bar" style={{ height: `${item.value}%` }} /><span>{item.day}</span></div>)}</div>
              <svg className="admin-chart-line" viewBox="0 0 700 180" preserveAspectRatio="none" aria-hidden="true"><path d="M20 137 C65 125 75 111 120 113 S180 150 220 124 S275 70 320 68 S370 135 420 105 S485 21 530 45 S595 30 650 60" /></svg>
            </div>
          </div>
          <div className="admin-trend-foot"><span><b>Người đăng trong ngày</b><strong>2.040</strong></span><span><b>Bài đăng mới</b><strong>Honda SH 150i</strong></span><span><b>Tỷ lệ duyệt minh họa</b><strong className="green-text">18.4%</strong></span></div>
        </section>

        <section className="admin-widget admin-category-widget">
          <div className="admin-widget-heading"><div><h2>Phân bố danh mục bài đăng</h2><p>Dữ liệu minh họa</p></div><Icon name="tag" size={17} /></div>
          <div className="admin-donut-wrap"><div className="admin-donut"><div><small>Tổng bài đăng</small><strong>{number(stats.posts)}</strong><small>Bài đăng</small></div></div></div>
          <ul className="admin-category-list">{sampleCategories.map((category) => <li key={category.label}><span><i style={{ background: category.color }} />{category.label}</span><b>{category.count}</b></li>)}</ul>
          {isAdmin && <Link className="admin-widget-link" to="/quan-tri/danh-muc">Quản lý danh mục <span>→</span></Link>}
        </section>
      </div>

      {/* Hai danh sách dưới đây là dữ liệu giả: cần API giao dịch quản trị và API nhật ký kiểm duyệt. */}
      <div className="admin-dashboard-grid admin-dashboard-grid-bottom">
        <section className="admin-widget">
          <div className="admin-widget-heading"><div><h2>Giao dịch nổi bật</h2><p>Dữ liệu minh họa · Không lấy từ giao dịch thật</p></div><span className="admin-demo-tag">24 giờ qua</span></div>
          <div className="admin-transaction-list">{sampleTransactions.map((item, index) => <div className="admin-transaction" key={item.code}><span className={`admin-rank rank-${index + 1}`}>{index + 1}</span><span className="admin-transaction-name"><b>{item.name}</b><small>{item.code} · {item.amount}</small></span><span className="admin-change">{item.change}</span></div>)}</div>
          <div className="admin-widget-footer">Hiển thị 4 giao dịch giả lập <span>API giao dịch quản trị chưa có</span></div>
        </section>

        <section className="admin-widget">
          <div className="admin-widget-heading"><div><h2>Hoạt động kiểm duyệt</h2><p>Dữ liệu minh họa · API chưa có danh sách bài chờ duyệt</p></div><span className="admin-live-dot">● Mẫu</span></div>
          <div className="admin-activity-list">{sampleActivity.map((item, index) => <div className="admin-activity" key={`${item.title}-${index}`}><span className={`admin-activity-icon ${item.tone}`}><Icon name={item.icon as "check" | "flag" | "shield"} size={15} /></span><span className="admin-activity-copy"><b>{item.title}</b><small>{item.detail}</small></span><span className={`admin-status ${item.tone}`}>{item.status}</span></div>)}</div>
          <div className="admin-widget-footer">Xin chào, {user?.hoTen ?? "quản trị viên"}<Link to="/quan-tri/duyet-bai">Mở trang duyệt bài →</Link></div>
        </section>
      </div>
      <p className="admin-data-note">Các mục có nhãn “Minh họa” là dữ liệu mẫu vì backend chưa có API tương ứng.</p>
    </div>
  );
}
