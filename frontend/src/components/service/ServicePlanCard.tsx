import type { DichVu } from "../../types";
import { formatPrice } from "../../utils/format";

interface Props {
  service: DichVu;
  index: number;
  busy: boolean;
  onBuy: (id: number) => void;
}

export default function ServicePlanCard({ service, index, busy, onBuy }: Props) {
  const featured = index === 1;

  return (
    <article className={`service-plan-card${featured ? " is-featured" : ""}`}>
      {featured && <span className="service-plan-ribbon">ĐƯỢC NGƯỜI BÁN QUAN TÂM</span>}
      <div className="service-plan-topline">
        <span className={`service-plan-label${featured ? " is-orange" : ""}`}>
          {featured ? "Gói nổi bật" : `Gói dịch vụ ${String(index + 1).padStart(2, "0")}`}
        </span>
        <span className="service-plan-icon" aria-hidden="true">✦</span>
      </div>

      <div className="service-plan-copy">
        <h3>{service.tenDichVu}</h3>
        <p>Ưu tiên hiển thị tin đăng trong {service.thoiGianDichVu} ngày.</p>
      </div>

      <div className="service-plan-price">
        <strong>{formatPrice(service.gia)}</strong>
        <span>/ {service.thoiGianDichVu} ngày</span>
      </div>

      <ul className="service-plan-benefits">
        <li><span aria-hidden="true">✓</span> Tin đăng được ưu tiên hiển thị</li>
        <li><span aria-hidden="true">✓</span> Thời hạn rõ ràng: {service.thoiGianDichVu} ngày</li>
        <li><span aria-hidden="true">✓</span> Thanh toán an toàn qua hệ thống</li>
      </ul>

      <button
        type="button"
        className={`service-plan-button${featured ? " is-primary" : ""}`}
        disabled={busy}
        onClick={() => onBuy(service.id)}
      >
        {busy ? "Đang tạo đơn…" : "Chọn gói dịch vụ"}
        {!busy && <span aria-hidden="true">→</span>}
      </button>
    </article>
  );
}
