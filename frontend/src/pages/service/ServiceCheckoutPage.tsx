import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { dichVuApi } from "../../api/dichVu";
import { nguoiDungApi } from "../../api/nguoiDung";
import { ErrorBox, Spinner } from "../../components/common/State";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/error";
import { formatPrice } from "../../utils/format";

function paymentName(name: string) {
  return name.toLowerCase() === "momo" ? "MoMo" : "VNPay";
}

export default function ServiceCheckoutPage() {
  useDocumentTitle("Chi tiết thanh toán");
  const { id } = useParams();
  const serviceId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();
  const services = useFetch(() => dichVuApi.danhSach(), []);
  const profile = useFetch(() => nguoiDungApi.layHoSo(), []);
  const methods = useFetch(() => dichVuApi.phuongThucThanhToan(), []);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const service = services.data?.find((item) => item.id === serviceId);
  const availableMethods = useMemo(
    () => (methods.data ?? []).filter((method) => ["momo", "vnpay"].includes(method.tenPhuongThuc.toLowerCase())),
    [methods.data],
  );

  useEffect(() => {
    if (selectedMethod === null && availableMethods.length > 0) {
      setSelectedMethod(availableMethods[0].id);
    }
  }, [availableMethods, selectedMethod]);

  const confirmPayment = async () => {
    if (!service || selectedMethod === null) return;
    setSubmitting(true);
    try {
      const order = await dichVuApi.mua(service.id, selectedMethod);
      if (!order.urlThanhToan) {
        toast("Máy chủ chưa trả về liên kết thanh toán.", "error");
        return;
      }
      window.location.assign(order.urlThanhToan);
    } catch (error) {
      toast(getErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const loadError = services.error || profile.error || methods.error;
  if (services.loading || profile.loading || methods.loading) {
    return <main className="service-checkout-state"><Spinner /></main>;
  }
  if (loadError) {
    return <main className="service-checkout-state"><ErrorBox message={loadError} onRetry={() => {
      services.reload(); profile.reload(); methods.reload();
    }} /></main>;
  }
  if (!service) {
    return (
      <main className="service-checkout-state">
        <h1>Không tìm thấy gói dịch vụ</h1>
        <Link to="/dich-vu" className="checkout-button">Quay lại danh sách gói</Link>
      </main>
    );
  }

  return (
    <main className="service-checkout-page">
      <div className="checkout-heading">
        <span className="service-section-kicker">HOÀN TẤT ĐĂNG KÝ DỊCH VỤ</span>
        <h1>Chi tiết thanh toán</h1>
        <p>Kiểm tra thông tin gói và chọn phương thức thanh toán để tiếp tục.</p>
      </div>

      <ol className="checkout-progress" aria-label="Các bước mua dịch vụ">
        <li className="is-done"><span>✓</span> Chọn gói</li>
        <li className="is-current"><span>2</span> Chi tiết thanh toán</li>
        <li><span>3</span> Hoàn tất</li>
      </ol>

      <div className="checkout-layout">
        <div className="checkout-main-column">
          <section className="checkout-panel">
            <div className="checkout-panel-heading">
              <div><span className="checkout-step-index">01</span><h2>Gói dịch vụ đã chọn</h2></div>
              <Link to="/dich-vu">Đổi gói</Link>
            </div>
            <div className="checkout-service-card">
              <div className="checkout-service-icon" aria-hidden="true">✦</div>
              <div className="checkout-service-info">
                <span className="checkout-service-label">GÓI DỊCH VỤ</span>
                <h3>{service.tenDichVu}</h3>
                <p>Ưu tiên hiển thị tin đăng trong {service.thoiGianDichVu} ngày</p>
              </div>
              <strong className="checkout-service-price">{formatPrice(service.gia)}</strong>
            </div>
            <div className="checkout-benefit-grid">
              <div><span>◷</span><p><strong>Thời hạn sử dụng</strong><small>{service.thoiGianDichVu} ngày kể từ khi kích hoạt</small></p></div>
              <div><span>↗</span><p><strong>Ưu tiên hiển thị</strong><small>Tăng khả năng tiếp cận người mua</small></p></div>
            </div>
          </section>

          <section className="checkout-panel">
            <div className="checkout-panel-heading">
              <div><span className="checkout-step-index">02</span><h2>Thông tin người mua</h2></div>
              <span className="checkout-verified">✓ Tài khoản đã xác thực</span>
            </div>
            <div className="checkout-buyer">
              <div className="checkout-avatar">{profile.data?.hoTen?.trim().charAt(0).toUpperCase() || "U"}</div>
              <div className="checkout-buyer-details">
                <strong>{profile.data?.hoTen || "Người dùng"}</strong>
                <span>{profile.data?.email || "Chưa cập nhật email"}</span>
                <span>{profile.data?.soDienThoai || "Chưa cập nhật số điện thoại"}</span>
              </div>
              <Link to="/tai-khoan/ho-so" className="checkout-edit-link">Chỉnh sửa</Link>
            </div>
          </section>

          <section className="checkout-panel">
            <div className="checkout-panel-heading">
              <div><span className="checkout-step-index">03</span><h2>Phương thức thanh toán</h2></div>
              <span className="checkout-verified">Thanh toán bảo mật</span>
            </div>
            {availableMethods.length === 0 ? (
              <div className="checkout-no-method">Hiện chưa có cổng thanh toán khả dụng. Vui lòng thử lại sau.</div>
            ) : (
              <div className="checkout-method-list">
                {availableMethods.map((method) => {
                  const name = paymentName(method.tenPhuongThuc);
                  return (
                    <label key={method.id} className={`checkout-method${selectedMethod === method.id ? " is-selected" : ""}`}>
                      <input
                        type="radio"
                        name="payment-method"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={() => setSelectedMethod(method.id)}
                      />
                      <span className={`checkout-method-logo is-${name.toLowerCase()}`}>{name === "MoMo" ? "M" : "V"}</span>
                      <span className="checkout-method-copy"><strong>{name}</strong><small>{method.moTa || `Thanh toán an toàn qua ${name}`}</small></span>
                      <span className="checkout-method-tag">{name === "MoMo" ? "Ví điện tử" : "Phổ biến"}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="checkout-summary">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="checkout-summary-product"><span>{service.tenDichVu}</span><strong>{formatPrice(service.gia)}</strong></div>
          <div className="checkout-summary-row"><span>Thời hạn</span><span>{service.thoiGianDichVu} ngày</span></div>
          <div className="checkout-summary-row"><span>Phí thanh toán</span><strong>Miễn phí</strong></div>
          <div className="checkout-summary-total"><span>Tổng thanh toán</span><strong>{formatPrice(service.gia)}</strong></div>
          <button
            type="button"
            className="checkout-button"
            disabled={submitting || selectedMethod === null || availableMethods.length === 0}
            onClick={() => void confirmPayment()}
          >
            {submitting ? "Đang chuyển đến cổng thanh toán…" : `Xác nhận thanh toán · ${formatPrice(service.gia)}`}
          </button>
          <p className="checkout-secure-note"><span>◇</span> Thông tin thanh toán được mã hóa và bảo mật.</p>
          <Link to="/dich-vu" className="checkout-back-link">← Quay lại chọn gói khác</Link>
        </aside>
      </div>
    </main>
  );
}
