import { useEffect, useRef, useState } from "react";
import type { DichVu } from "../../types";
import ServicePlanCard from "./ServicePlanCard";

interface Props {
  services: DichVu[];
  busyId: number | null;
  onBuy: (id: number) => void;
}

export default function ServicePlanGrid({ services, busyId, onBuy }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(4);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(services.length > 4);
  const hasOverflow = services.length > visibleCount;

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(window.innerWidth <= 600 ? 1 : window.innerWidth <= 1000 ? 2 : 4);
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const updateNavigation = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setCanGoBack(viewport.scrollLeft > 2);
    setCanGoForward(viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 2);
  };

  const move = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({ left: direction * viewport.clientWidth * 0.9, behavior: "smooth" });
  };

  useEffect(() => {
    updateNavigation();
  }, [services.length, visibleCount]);

  return (
    <section className="service-plans-section" aria-labelledby="service-plans-title">
      <div className="service-section-heading">
        <span className="service-section-kicker">BẢNG GIÁ DỊCH VỤ</span>
        <h2 id="service-plans-title">Chọn gói giải pháp phù hợp với mục tiêu bán hàng của bạn</h2>
        <p>Linh hoạt thời hạn sử dụng, chọn gói phù hợp để quảng bá tin đăng hiệu quả hơn.</p>
      </div>
      <div className={`service-plans-carousel${services.length <= visibleCount ? " is-centered" : ""}`}>
        <div className="service-plans-viewport" ref={viewportRef} onScroll={updateNavigation}>
          <div className="service-plans-track">
            {services.map((service, index) => (
              <div className="service-plan-slide" key={service.id}>
                <ServicePlanCard
                  service={service}
                  index={index}
                  busy={busyId === service.id}
                  onBuy={onBuy}
                />
              </div>
            ))}
          </div>
        </div>
        {hasOverflow && (
          <div className="service-plans-controls" aria-label="Điều hướng các gói dịch vụ">
            <button type="button" aria-label="Xem các gói trước" disabled={!canGoBack} onClick={() => move(-1)}>‹</button>
            <span>{Math.min(services.length, visibleCount)} gói mỗi lượt</span>
            <button type="button" aria-label="Xem các gói tiếp theo" disabled={!canGoForward} onClick={() => move(1)}>›</button>
          </div>
        )}
      </div>
    </section>
  );
}
