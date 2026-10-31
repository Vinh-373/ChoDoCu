import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { dichVuApi } from "../../api/dichVu";
import Icon from "../../components/common/Icon";
import Pagination from "../../components/common/Pagination";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import type { PhuongThucThanhToan } from "../../types";
import { formatDateTime } from "../../utils/format";
import { MOCK_PAYMENTS, MOCK_STATUS_LABELS } from "./adminPaymentSamples";

const PAGE_SIZE = 8;
const money = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} đ`;

export default function AdminPayments() {
  useDocumentTitle("Quản lý giao dịch & thanh toán");

  // API có thật hiện chỉ trả về các phương thức đang hoạt động, không trả lịch sử giao dịch toàn hệ thống.
  // Gọi API công khai này để lấy danh sách kênh làm bộ lọc và nhãn phương thức.
  const { data: paymentMethods, loading: methodsLoading, error: methodsError, reload: reloadMethods } =
    useFetch(() => dichVuApi.phuongThucThanhToan(), []);

  // Trạng thái bộ lọc là state giao diện; khi đổi một tiêu chí thì quay về trang đầu để tránh trang rỗng.
  const [keyword, setKeyword] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("7");
  const [page, setPage] = useState(1);

  // Gắn tên phương thức thật nếu backend trả danh sách; bản thân giao dịch vẫn là mẫu.
  // methodIndex chỉ là cách gắn kênh minh họa vào từng dòng, không phải quan hệ lưu trong backend.
  const rows = useMemo(() => MOCK_PAYMENTS.map((item) => ({
    ...item,
    methodName: paymentMethods?.length
      ? paymentMethods[item.methodIndex % paymentMethods.length].tenPhuongThuc
      : item.fallbackMethod,
    createdAt: new Date(Date.now() - item.minutesAgo * 60_000).toISOString(),
  })), [paymentMethods]);

  // KPI được tính từ bộ mẫu để các thẻ nhất quán với những dòng trong bảng; giao diện đánh dấu rõ dữ liệu giả.
  const summary = useMemo(() => {
    const successful = rows.filter((row) => row.status === "ThanhCong");
    const pending = rows.filter((row) => row.status === "ChoXuLy").length;
    const failed = rows.filter((row) => row.status === "ThatBai").length;
    const channelCounts = rows.reduce<Record<string, number>>((counts, row) => {
      counts[row.methodName] = (counts[row.methodName] ?? 0) + 1;
      return counts;
    }, {});
    const [popularChannel, popularCount] = Object.entries(channelCounts).sort((a, b) => b[1] - a[1])[0] ?? ["—", 0];
    return {
      total: rows.length,
      pending,
      failed,
      revenue: successful.reduce((sum, row) => sum + row.amount, 0),
      popularChannel,
      popularPercent: rows.length ? Math.round((popularCount / rows.length) * 100) : 0,
    };
  }, [rows]);

  // Lọc danh sách mẫu theo các điều khiển ở trang; khi có API admin sẽ chuyển các tiêu chí này thành query params.
  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase("vi");
    const days = periodFilter === "all" ? null : Number(periodFilter);
    const since = days === null ? null : Date.now() - days * 24 * 60 * 60 * 1000;
    return rows.filter((row) => {
      const matchesKeyword = !normalizedKeyword ||
        `${row.id} ${row.transactionRef} ${row.serviceName} ${row.buyer} ${row.methodName}`.toLocaleLowerCase("vi").includes(normalizedKeyword);
      const matchesMethod = !methodFilter || row.methodName === methodFilter;
      const matchesStatus = !statusFilter || row.status === statusFilter;
      const matchesPeriod = since === null || new Date(row.createdAt).getTime() >= since;
      return matchesKeyword && matchesMethod && matchesStatus && matchesPeriod;
    });
  }, [rows, keyword, methodFilter, statusFilter, periodFilter]);

  // Phân trang phía trình duyệt cho dữ liệu minh họa; API quản trị tương lai nên phân trang tại backend.
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visibleRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetFilters = () => {
    setKeyword("");
    setMethodFilter("");
    setStatusFilter("");
    setPeriodFilter("7");
    setPage(1);
    // Tải lại danh sách phương thức thanh toán thật; các dòng giao dịch mẫu vẫn giữ nguyên.
    reloadMethods();
  };

  // Xuất CSV của các dòng đang lọc; file hiện chứa dữ liệu minh họa vì chưa có API xuất giao dịch quản trị.
  const exportCsv = () => {
    const header = ["Mã giao dịch", "Gói dịch vụ", "Khách hàng", "Số tiền", "Phương thức", "Thời gian", "Trạng thái"];
    const lines = filteredRows.map((row) => [row.id, row.serviceName, row.buyer, row.amount, row.methodName, row.createdAt, MOCK_STATUS_LABELS[row.status]]);
    const csv = [header, ...lines].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "giao-dich-minh-hoa.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  // Mỗi KPI đều lấy từ bộ giao dịch giả; chú thích đặt sát ngay dưới hàng KPI để tránh nhầm là số liệu thật.
  return (
    <div className="admin-payments-page">
      <div className="admin-payments-breadcrumb"><span>TÀI CHÍNH & DOANH THU</span><b>·</b> Theo dõi giao dịch</div>
      <header className="admin-payments-heading">
        <div><h1 className="admin-page-title">Quản lý giao dịch &amp; thanh toán</h1><p>Theo dõi lịch sử thanh toán dịch vụ và mua gói dịch vụ trên hệ thống.</p></div>
        <div className="admin-payments-heading-actions">
          <button type="button" className="admin-payments-button is-light" onClick={exportCsv}><Icon name="download" size={15} /> Xuất CSV</button>
          <button type="button" className="admin-payments-button is-primary" title="Tải lại phương thức thanh toán thật; các giao dịch minh họa không thay đổi" onClick={resetFilters}><Icon name="refresh" size={15} /> Làm mới</button>
        </div>
      </header>

      {/* Các số liệu tổng hợp bên dưới chỉ được tính từ MOCK_PAYMENTS, tuyệt đối không đại diện doanh thu thật. */}
      <section className="admin-payment-summary" aria-label="Tổng quan giao dịch minh họa">
        <article className="admin-payment-kpi tone-green"><div><span>Tổng thanh toán</span><i><Icon name="check" size={17} /></i></div><strong>{summary.total.toLocaleString("vi-VN")} <small>đơn</small></strong><p>Thành công: {money(summary.revenue)}</p></article>
        <article className="admin-payment-kpi tone-orange"><div><span>Chờ duyệt / chờ cổng</span><i><Icon name="clock" size={17} /></i></div><strong>{summary.pending} <small>đơn</small></strong><p>Cần kiểm tra phản hồi cổng</p></article>
        <article className="admin-payment-kpi tone-red"><div><span>Thất bại / đã hủy</span><i><Icon name="warning" size={17} /></i></div><strong>{summary.failed} <small>đơn</small></strong><p>Giao dịch không thành công</p></article>
        <article className="admin-payment-kpi tone-purple"><div><span>Cổng phổ biến nhất</span><i><Icon name="payments" size={17} /></i></div><strong className="admin-payment-kpi-channel">{summary.popularChannel}</strong><p>{summary.popularPercent}% số dòng minh họa</p></article>
      </section>
      <p className="admin-payment-demo-note"><b>Dữ liệu minh họa:</b> toàn bộ số KPI, số tiền và trạng thái phía trên được tính từ danh sách mẫu trong code. Backend chưa có API tổng hợp giao dịch dành cho quản trị.</p>

      {/* Khu vực bộ lọc: danh sách phương thức được lấy thật từ API; các lựa chọn trạng thái/ngày lọc bảng mẫu hiện tại. */}
      <section className="admin-payment-table-card">
        <div className="admin-payment-filters">
          <label className="admin-payment-search"><Icon name="search" size={16} /><input value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(1); }} placeholder="Tìm theo mã GD, tên gói dịch vụ, khách hàng..." aria-label="Tìm giao dịch" /></label>
          <label><span className="sr-only">Cổng thanh toán</span><select value={methodFilter} onChange={(event) => { setMethodFilter(event.target.value); setPage(1); }}><option value="">Cổng: Tất cả</option>{(paymentMethods ?? []).map((method: PhuongThucThanhToan) => <option key={method.id} value={method.tenPhuongThuc}>{method.tenPhuongThuc}</option>)}</select></label>
          <label><span className="sr-only">Trạng thái</span><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="">Trạng thái: Tất cả</option><option value="ThanhCong">Thành công</option><option value="ChoXuLy">Chờ xác nhận</option><option value="ThatBai">Hủy / Hết hạn</option></select></label>
          <label><span className="sr-only">Khoảng thời gian</span><select value={periodFilter} onChange={(event) => { setPeriodFilter(event.target.value); setPage(1); }}><option value="7">7 ngày qua</option><option value="30">30 ngày qua</option><option value="all">Tất cả thời gian</option></select></label>
        </div>
        <div className="admin-payment-api-note">
          {methodsLoading ? <span>Đang tải phương thức thanh toán…</span> : methodsError ? <span className="is-error">Không tải được danh sách phương thức thật: {methodsError}</span> : <span><b>Phương thức thật:</b> {paymentMethods?.length ? paymentMethods.map((method) => method.tenPhuongThuc).join(", ") : "API chưa trả phương thức đang hoạt động."}</span>}
          <small>GET /api/thanh-toan/phuong-thuc</small>
        </div>

        {/* Bảng giao dịch mô phỏng hình mẫu. Khi backend bổ sung API admin, thay MOCK_PAYMENTS bằng dữ liệu API. */}
        {methodsLoading && !paymentMethods ? <Spinner label="Đang tải dữ liệu thanh toán…" /> : filteredRows.length === 0 ? <Empty title="Không tìm thấy giao dịch phù hợp" /> : (
          <div className="admin-payment-table-scroll">
            <table className="admin-payment-table">
              <thead><tr><th><input type="checkbox" aria-label="Chọn toàn bộ giao dịch" disabled /></th><th>Mã giao dịch</th><th>Gói dịch vụ</th><th>Khách hàng / đối tác</th><th>Số tiền</th><th>Cổng / kênh TT</th><th>Thời gian</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
              <tbody>{visibleRows.map((row) => (
                <tr key={row.id}>
                  <td><input type="checkbox" aria-label={`Chọn ${row.id}`} disabled /></td>
                  <td><b className="admin-payment-id">#{row.id}</b><small>Mã GD cổng: {row.transactionRef}</small></td>
                  <td><span className="admin-payment-plan-dot" /> <b>{row.serviceName}</b><small><em>{row.serviceTag}</em> Đăng tin + đẩy tin</small></td>
                  <td><div className="admin-payment-buyer"><span>{row.buyer.slice(0, 1)}</span><div><b>{row.buyer}</b><small>{row.buyerPhone}</small></div></div></td>
                  <td><b className={row.status === "ThatBai" ? "is-struck" : "admin-payment-amount"}>{money(row.amount)}</b><small>{row.status === "ThanhCong" ? "Đã xác nhận" : row.status === "ChoXuLy" ? "Chờ phản hồi" : "Chưa thanh toán"}</small></td>
                  <td><b>{row.methodName}</b><small>Phương thức {row.methodIndex + 1}</small></td>
                  <td><b>{formatDateTime(row.createdAt)}</b><small>{row.minutesAgo < 60 ? `${row.minutesAgo} phút trước` : row.minutesAgo < 1_440 ? `${Math.floor(row.minutesAgo / 60)} giờ trước` : `${Math.floor(row.minutesAgo / 1_440)} ngày trước`}</small></td>
                  <td><span className={`admin-payment-status status-${row.status.toLowerCase()}`}><i />{MOCK_STATUS_LABELS[row.status]}</span></td>
                  <td><Link className="admin-payment-detail-link" to={`/quan-tri/thanh-toan/${row.id}`}><Icon name="search" size={13} /> Xem chi tiết</Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* Chú thích ngay dưới bảng: nội dung giao dịch là giả lập và chưa tồn tại endpoint quản trị để duyệt/xem chi tiết. */}
        <div className="admin-payment-table-footnote"><Icon name="info" size={15} /><span><b>Dữ liệu minh họa:</b> danh sách giao dịch, người mua, mã cổng, số tiền, thời gian và trạng thái dùng để dựng giao diện. API hiện tại chỉ trả lịch sử mua dịch vụ của chính tài khoản đăng nhập; chưa có API liệt kê toàn bộ giao dịch hoặc duyệt giao dịch cho Admin.</span></div>
        <div className="admin-payment-pagination"><span>Hiển thị {filteredRows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredRows.length)} / {filteredRows.length} giao dịch mẫu</span><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
      </section>

      {/* Lưu ý kỹ thuật được hiển thị luôn để phân biệt phần tích hợp API thật với các chức năng còn cần backend. */}
      <aside className="admin-payment-backend-note"><Icon name="shield" size={16} /><span>Để thay bảng mẫu bằng dữ liệu thật, cần API quản trị có phân trang/lọc, thống kê doanh thu, xem chi tiết và xử lý giao dịch. Nút xuất CSV hiện chỉ xuất các dòng minh họa đang lọc.</span></aside>
      {methodsError && <ErrorBox message={`Không lấy được phương thức thanh toán: ${methodsError}`} onRetry={reloadMethods} />}
    </div>
  );
}
