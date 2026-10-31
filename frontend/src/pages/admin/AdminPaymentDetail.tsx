import { Link, useParams } from "react-router-dom";
import { dichVuApi } from "../../api/dichVu";
import Icon from "../../components/common/Icon";
import { Empty, Spinner } from "../../components/common/State";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { formatDateTime } from "../../utils/format";
import { MOCK_PAYMENTS, MOCK_STATUS_LABELS } from "./adminPaymentSamples";

/** Chuyển số phút thành chuỗi ngắn để timeline mẫu nhìn gần với log cổng thanh toán. */
function relativeTime(minutes: number) {
  if (minutes < 60) return `${minutes} phút trước`;
  if (minutes < 1_440) return `${Math.floor(minutes / 60)} giờ trước`;
  return `${Math.floor(minutes / 1_440)} ngày trước`;
}

/** Bảng quyền lợi gói là nội dung mẫu vì bảng giao dịch hiện không trả quan hệ dịch vụ/chi tiết gói. */
function benefitsFor(tag: string) {
  if (tag.includes("Kim Cương")) return ["300 lượt đăng tin", "50 lượt đẩy tin", "Ưu tiên hiển thị", "Hạn dùng: 60 ngày"];
  if (tag.includes("Doanh nghiệp")) return ["500 lượt đăng tin", "100 lượt đẩy tin", "Hỗ trợ gian hàng", "Hạn dùng: 90 ngày"];
  return ["100 lượt đăng tin", "20 lượt đẩy tin", "Gắn nhãn tin nổi bật", "Hạn dùng: 30 ngày"];
}

/** Trang xem chi tiết một dòng giao dịch được chọn từ danh sách quản trị. */
export default function AdminPaymentDetail() {
  const { id = "" } = useParams();
  useDocumentTitle(`Chi tiết giao dịch ${id}`);

  // Phương thức thanh toán lấy từ API thật giống trang danh sách; endpoint này chỉ trả kênh đang hoạt động.
  const { data: methods, loading: methodsLoading } = useFetch(() => dichVuApi.phuongThucThanhToan(), []);

  // Tìm giao dịch theo mã trong cùng bộ dữ liệu mẫu dùng ở bảng. Đây là dữ liệu front-end, không phải API thật.
  const sample = MOCK_PAYMENTS.find((payment) => payment.id === id);
  const payment = sample ? {
    ...sample,
    methodName: methods?.length ? methods[sample.methodIndex % methods.length].tenPhuongThuc : sample.fallbackMethod,
    createdAt: new Date(Date.now() - sample.minutesAgo * 60_000).toISOString(),
  } : null;

  if (methodsLoading && !methods) return <div className="admin-payment-detail-state"><Spinner label="Đang tải chi tiết giao dịch…" /></div>;
  if (!payment) return <div className="admin-payment-detail-state"><Empty title="Không tìm thấy giao dịch minh họa"><Link to="/quan-tri/thanh-toan">Quay lại danh sách giao dịch</Link></Empty></div>;

  // Thông tin cá nhân bổ sung bên dưới được dựng để khớp mẫu giao diện; backend chưa có endpoint admin trả hồ sơ theo giao dịch.
  const normalizedBuyer = payment.buyer.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("vi").replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
  const fakeEmail = `${normalizedBuyer}@gmail.com`;
  const cccdTail = payment.id.slice(-6);
  const statusLabel = MOCK_STATUS_LABELS[payment.status];
  const packageBenefits = benefitsFor(payment.serviceTag);
  const isSuccess = payment.status === "ThanhCong";

  // Timeline là bản mô phỏng vòng đời thanh toán để trình bày; hiện backend không lưu và không trả lịch sử webhook cho Admin.
  const timeline = [
    { title: "Tạo giao dịch trên hệ thống", detail: `Khởi tạo đơn ${payment.id} · ${payment.serviceName}`, time: formatDateTime(new Date(new Date(payment.createdAt).getTime() - 4 * 60_000).toISOString()), icon: "check", tone: "success" },
    { title: "Gửi yêu cầu tới cổng thanh toán", detail: `Phương thức ${payment.methodName} · mã tham chiếu ${payment.transactionRef}`, time: formatDateTime(new Date(new Date(payment.createdAt).getTime() - 2 * 60_000).toISOString()), icon: "send", tone: "success" },
    { title: isSuccess ? "Cổng xác nhận thanh toán" : payment.status === "ChoXuLy" ? "Đang chờ phản hồi từ cổng" : "Cổng trả kết quả thất bại", detail: isSuccess ? "Kết quả callback được xác thực và khớp số tiền." : "Sự kiện dưới đây là nội dung mẫu, không lấy từ callback lưu trong hệ thống.", time: formatDateTime(payment.createdAt), icon: isSuccess ? "check" : "warning", tone: isSuccess ? "success" : "pending" },
    { title: isSuccess ? "Kích hoạt gói dịch vụ" : "Chưa kích hoạt dịch vụ", detail: isSuccess ? "Quyền lợi gói được mở cho tài khoản người mua (minh họa)." : "Không có thao tác duyệt thủ công qua API hiện tại.", time: relativeTime(payment.minutesAgo), icon: isSuccess ? "shield" : "clock", tone: isSuccess ? "success" : "pending" },
  ];

  return (
    <div className="admin-payment-detail-page">
      {/* Dải điều hướng và tiêu đề: mã giao dịch được lấy từ route để người quản trị nhận biết dòng đang xem. */}
      <div className="admin-payment-detail-breadcrumb"><Link to="/quan-tri">Quản trị</Link><span>/</span><Link to="/quan-tri/thanh-toan">Giao dịch &amp; thanh toán</Link><span>/</span><b>Chi tiết #{payment.id}</b></div>
      <header className="admin-payment-detail-heading">
        <div><p>TÀI CHÍNH &amp; DOANH THU</p><h1 className="admin-page-title">Chi tiết giao dịch #{payment.id}</h1><span className={`admin-payment-status status-${payment.status.toLowerCase()}`}><i />{statusLabel} {isSuccess ? "(Đã kích hoạt gói)" : "(minh họa)"}</span></div>
        <Link className="admin-payment-detail-back" to="/quan-tri/thanh-toan"><Icon name="left" size={15} /> Quay lại</Link>
      </header>

      {/* Cảnh báo nằm đầu trang chi tiết vì mọi giao dịch trong bộ hiện tại đều là mẫu; chỉ tên phương thức là API thật. */}
      <p className="admin-payment-detail-demo"><b>Dữ liệu minh họa:</b> chi tiết giao dịch, khách hàng, quyền lợi gói, timeline và webhook bên dưới không lấy từ backend. Tên phương thức được tải từ API <code>GET /api/thanh-toan/phuong-thuc</code>, nhưng việc gán phương thức đó cho giao dịch mẫu cũng chỉ nhằm minh họa.</p>

      <div className="admin-payment-detail-grid">
        {/* Cột trái: trạng thái, mã giao dịch và đối soát tiền. Toàn bộ trường giao dịch ở khối này là dữ liệu giả. */}
        <div className="admin-payment-detail-left">
          <section className="admin-payment-detail-card admin-payment-overview">
            <div className="admin-payment-detail-card-title"><span className="admin-payment-detail-icon is-green"><Icon name="check" size={18} /></span><div><h2>Thông tin giao dịch</h2><p>Trạng thái đối soát và mã tham chiếu</p></div><span className={`admin-payment-status status-${payment.status.toLowerCase()}`}><i />{statusLabel}</span></div>
            <div className="admin-payment-overview-grid"><div><small>Mã đơn hàng</small><b>#{payment.id}</b></div><div><small>Mã giao dịch cổng</small><b>{payment.transactionRef}</b></div><div><small>Thời gian tạo</small><b>{formatDateTime(payment.createdAt)}</b></div><div><small>Tên phương thức khả dụng (API)</small><b>{payment.methodName}</b></div><div><small>Trạng thái hiện tại</small><b>{statusLabel}</b></div><div><small>Thời gian ghi nhận</small><b>{isSuccess ? formatDateTime(payment.createdAt) : "Chưa có xác nhận"}</b></div></div>
            <div className="admin-payment-total"><span>Tổng thanh toán giao dịch (minh họa)</span><strong>{new Intl.NumberFormat("vi-VN").format(payment.amount)} đ</strong></div>
          </section>

          {/* Gói dịch vụ, giá niêm yết, khuyến mãi và quyền lợi không có trong DTO giao dịch quản trị nên được giả lập. */}
          <section className="admin-payment-detail-card">
            <div className="admin-payment-detail-card-title"><span className="admin-payment-detail-icon is-orange"><Icon name="tag" size={18} /></span><div><h2>Thông tin gói dịch vụ</h2><p>Gói và cấu phần thanh toán minh họa</p></div><span className="admin-payment-plan-label">{payment.serviceTag}</span></div>
            <div className="admin-payment-package"><span className="admin-payment-package-mark">✦<small>VIP</small></span><div><b>{payment.serviceName} – Gói {payment.serviceTag}</b><small>Mã cấu hình mẫu: PKG-{payment.methodIndex + 1} · Thời hạn dịch vụ</small><ul>{packageBenefits.map((benefit) => <li key={benefit}><Icon name="check" size={13} />{benefit}</li>)}</ul></div><span className="admin-payment-package-price">{new Intl.NumberFormat("vi-VN").format(payment.amount)} đ</span></div>
            <div className="admin-payment-price-lines"><div><span>Tạm tính giá trị gói</span><b>{new Intl.NumberFormat("vi-VN").format(payment.amount)} đ</b></div><div><span>Khuyến mãi / Voucher áp dụng</span><b>0 đ</b></div><div><span>Thuế GTGT</span><b>0 đ</b></div><div><span>Phí giao dịch cổng thanh toán</span><b>0 đ (minh họa)</b></div></div>
            <div className="admin-payment-total"><span>Tổng thanh toán thực tế <small>Đã thanh toán qua {payment.methodName} (mẫu)</small></span><strong>{new Intl.NumberFormat("vi-VN").format(payment.amount)} đ</strong></div>
            <p className="admin-payment-inline-note">Dữ liệu gói và phân bổ giá chỉ để minh họa. Backend hiện chưa trả chi tiết từng dòng giá cho Admin.</p>
          </section>
        </div>

        {/* Cột phải: hồ sơ người mua dựng từ dòng mẫu, không truy vấn hồ sơ thật bằng ID người dùng. */}
        <div className="admin-payment-detail-right">
          <section className="admin-payment-detail-card">
            <div className="admin-payment-detail-card-title"><span className="admin-payment-detail-icon is-gray"><Icon name="user" size={17} /></span><div><h2>Khách hàng thanh toán</h2><p>Thông tin tài khoản (minh họa)</p></div></div>
            <div className="admin-payment-customer"><span className="admin-payment-customer-avatar">{payment.buyer.slice(0, 1)}</span><div><b>{payment.buyer} <Icon name="check" size={13} /></b><small>Thành viên từ 12/2022 · Điểm uy tín: 99.4%</small><small>CCCD: 0790{cccdTail}****</small></div></div>
            <dl className="admin-payment-customer-fields"><div><dt>Điện thoại</dt><dd>{payment.buyerPhone.replaceAll(" · ", "")}</dd></div><div><dt>Email</dt><dd>{fakeEmail}</dd></div><div><dt>Số dư tài khoản</dt><dd className="is-orange">45.000 đ</dd></div><div><dt>Khu vực hoạt động</dt><dd>Phường Tân Phong, TP. Hồ Chí Minh</dd></div></dl>
            <div className="admin-payment-customer-stats"><span><b>34</b><small>Tin đăng đã bán</small></span><span><b>128</b><small>Giao dịch đã chốt</small></span></div>
          </section>

          {/* Các thao tác được dựng giống ảnh nhưng khóa lại vì hiện không có endpoint email/xác nhận/hoàn tiền quản trị. */}
          <section className="admin-payment-detail-card admin-payment-operations">
            <div className="admin-payment-detail-card-title"><span className="admin-payment-detail-icon is-orange"><Icon name="grid" size={17} /></span><div><h2>Thao tác &amp; Quản trị giao dịch</h2><p>Chỉ bật khi backend có API quản trị tương ứng</p></div></div>
            <button type="button" disabled><Icon name="send" size={14} /> Gửi lại email biên lai thanh toán</button>
            <button type="button" disabled><Icon name="refresh" size={14} /> Ghi nhận gói thủ công</button>
            <button type="button" className="is-danger" disabled><Icon name="warning" size={14} /> Yêu cầu hoàn tiền (Refund)</button>
            <p><b>Ghi chú nội bộ Admin</b><span>Chỉ nhân viên quản trị xem</span></p>
            <blockquote>Giao dịch hiện dùng dữ liệu mẫu để trình bày giao diện. Các thao tác email, ghi nhận thủ công và hoàn tiền chưa có API.</blockquote>
            <div className="admin-payment-note-meta">Cập nhật lần cuối: minh họa · Quản trị viên</div>
          </section>
        </div>

        {/* Timeline là nội dung dựng mẫu; callback thực có ở backend nhưng chưa được lưu thành nhật ký để hiển thị ở Admin. */}
        <section className="admin-payment-detail-card admin-payment-timeline">
          <div className="admin-payment-detail-card-title"><span className="admin-payment-detail-icon is-gray"><Icon name="clock" size={17} /></span><div><h2>Nhật ký &amp; Lịch sử trạng thái giao dịch</h2><p>Các bước dưới đây chỉ mô phỏng luồng thanh toán</p></div><span className="admin-payment-log-source">Không có API log</span></div>
          <ol>{timeline.map((item, index) => <li key={`${item.title}-${index}`}><span className={`admin-payment-timeline-dot ${item.tone}`}><Icon name={item.icon as "check" | "send" | "warning" | "shield" | "clock"} size={13} /></span><div><b>{item.title}</b><small>{item.detail}</small></div><time>{item.time}</time></li>)}</ol>
          <p className="admin-payment-inline-note">Dữ liệu minh họa: backend nhận callback VNPay/MoMo nhưng chưa có endpoint nhật ký sự kiện cho quản trị.</p>
        </section>

        {/* Dữ liệu webhook bên dưới hoàn toàn là mẫu vì backend chỉ xử lý callback, không cung cấp log tra cứu. */}
        <section className="admin-payment-detail-card admin-payment-webhook">
          <div className="admin-payment-detail-card-title"><span className="admin-payment-detail-icon is-orange"><Icon name="image" size={16} /></span><div><h2>API Webhook Trace</h2><p>Phản hồi IPN / cổng thanh toán (mẫu)</p></div></div>
          <div className="admin-payment-webhook-row"><span>Response</span><b>{isSuccess ? "HTTP 200 OK" : payment.status === "ChoXuLy" ? "Đang chờ callback" : "HTTP 400 / timeout"}</b><small>142ms (mẫu)</small></div>
          <div className="admin-payment-webhook-row"><span>Gateway</span><b>{payment.methodName}</b><small>Đã che dữ liệu nhạy cảm</small></div>
          <p className="admin-payment-inline-note">Dữ liệu webhook minh họa, không phải log từ callback thực.</p>
        </section>
      </div>
    </div>
  );
}
