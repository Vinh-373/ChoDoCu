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
      </div>

      <div className="service-plan-price">
        <strong>{formatPrice(service.gia)}</strong>
        <span>/ {service.thoiGianDichVu} ngày</span>
      </div>

      <ul className="service-plan-benefits">
        {service.luotDang > 0 && <li><span aria-hidden="true">✓</span> +{service.luotDang} lượt đăng tin</li>}
        {service.luotDay > 0 && <li><span aria-hidden="true">✓</span> +{service.luotDay} lượt đẩy tin</li>}
        <li><span aria-hidden="true">✓</span> Ưu tiên hiển thị tin đăng trong {service.thoiGianDichVu} ngày</li>
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
