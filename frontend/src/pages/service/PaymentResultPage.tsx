import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { dichVuApi } from "../../api/dichVu";
import { useAuth } from "../../contexts/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getErrorMessage } from "../../utils/error";
import { formatPrice } from "../../utils/format";
import type { ThanhToanTrangThai } from "../../types";

type ResultState = "loading" | "success" | "failed" | "pending" | "error";
const MAX_CHECKS = 15;
const CHECK_DELAY_MS = 2000;

export default function PaymentResultPage() {
  useDocumentTitle("Kết quả thanh toán");
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const paymentId = Number(searchParams.get("paymentId"));
  const [status, setStatus] = useState<ResultState>("loading");
  const [payment, setPayment] = useState<ThanhToanTrangThai | null>(null);
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    let checks = 0;

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      setStatus("error");
      setMessage("Không tìm thấy mã giao dịch trong đường dẫn trả về.");
      return () => undefined;
    }
    if (!user) {
      setStatus("error");
      setMessage("Vui lòng đăng nhập lại để kiểm tra kết quả giao dịch.");
      return () => undefined;
    }

    setStatus("loading");
    setMessage("");

    const checkPayment = async () => {
      try {
        const result = await dichVuApi.trangThai(paymentId);
        if (cancelled) return;
        setPayment(result);
        if (result.trangThai === "ThanhCong") {
          setStatus("success");
          return;
        }
        if (result.trangThai === "ThatBai") {
          setStatus("failed");
          return;
        }
        checks += 1;
        if (checks >= MAX_CHECKS) {
          setStatus("pending");
          return;
        }
        setStatus("loading");
        timer = window.setTimeout(() => void checkPayment(), CHECK_DELAY_MS);
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setMessage(getErrorMessage(error));
      }
    };

    void checkPayment();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [paymentId, retry, user]);

  const copy = {
    success: {
      icon: "✓",
      title: "Giao dịch đã hoàn tất thành công!",
      description: "Gói dịch vụ của bạn đã được kích hoạt. Bạn có thể tiếp tục sử dụng các tiện ích dành cho người bán.",
    },
    failed: {
      icon: "×",
      title: "Thanh toán chưa thành công",
      description: "Giao dịch bị từ chối hoặc đã bị hủy. Bạn có thể quay lại danh sách gói và thử lại.",
    },
    pending: {
      icon: "…",
      title: "Giao dịch đang được xử lý",
      description: "Cổng thanh toán chưa gửi kết quả cuối cùng. Trạng thái giao dịch sẽ tự cập nhật trong lịch sử mua gói.",
    },
    error: {
      icon: "!",
      title: "Chưa thể kiểm tra giao dịch",
      description: message || "Đã có lỗi khi kiểm tra trạng thái thanh toán.",
    },
    loading: {
      icon: "…",
      title: "Đang xác nhận thanh toán",
      description: "Vui lòng chờ trong giây lát, chúng tôi đang kiểm tra trạng thái giao dịch với máy chủ.",
    },
  }[status];

  return (
    <main className="payment-result-page">
      <div className={`payment-result-card is-${status}`}>
        <div className="payment-result-orbit" aria-hidden="true" />
        <div className="payment-result-icon" aria-hidden="true">{copy.icon}</div>
        {status === "success" && <span className="payment-result-badge">GIAO DỊCH THÀNH CÔNG</span>}
        <h1>{copy.title}</h1>
        <p className="payment-result-description">{copy.description}</p>

        {payment && (
          <div className="payment-result-summary">
            <span>Mã thanh toán <strong>#{payment.idThanhToan}</strong></span>
            <span>Số tiền <strong>{formatPrice(payment.tongTien)}</strong></span>
          </div>
        )}

        {status === "loading" && <span className="payment-result-spinner" aria-label="Đang tải" />}
        <div className="payment-result-actions">
          {status === "success" ? (
            <Link className="payment-result-primary" to="/dich-vu">Tiếp tục sử dụng dịch vụ</Link>
          ) : status === "pending" ? (
            <button className="payment-result-primary" type="button" onClick={() => setRetry((value) => value + 1)}>Kiểm tra lại giao dịch</button>
          ) : status === "error" ? (
            <button className="payment-result-primary" type="button" onClick={() => setRetry((value) => value + 1)}>Thử kiểm tra lại</button>
          ) : status === "failed" ? (
            <Link className="payment-result-primary" to="/dich-vu">Quay lại chọn gói</Link>
          ) : null}
          <Link className="payment-result-secondary" to="/">Về trang chủ</Link>
        </div>
        <div className="payment-result-security"><span aria-hidden="true">◇</span> Trạng thái giao dịch được xác nhận từ máy chủ.</div>
      </div>
    </main>
  );
}
