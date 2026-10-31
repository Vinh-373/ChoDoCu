import { useMemo, useState } from "react";
import type { LichSuMuaDichVu } from "../../types";
import { formatPrice } from "../../utils/format";

type Filter = "all" | "active" | "expired";

function dateLabel(value: string | null) {
  if (!value) return "Chưa kích hoạt";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(new Date(value));
}

function isActive(item: LichSuMuaDichVu) {
  return item.trangThai === "ThanhCong" && (!item.ngayHetHan || new Date(item.ngayHetHan) >= new Date());
}

function isExpired(item: LichSuMuaDichVu) {
  return item.trangThai === "ThanhCong" && Boolean(item.ngayHetHan) && new Date(item.ngayHetHan!) < new Date();
}

function paymentLabel(status: string) {
  if (status === "ThanhCong") return "Thành công";
  if (status === "ThatBai") return "Thất bại";
  return "Đang xử lý";
}

export default function ServiceHistory({ items }: { items: LichSuMuaDichVu[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const newestFirst = useMemo(
    () => [...items].sort((a, b) => new Date(b.ngayMua).getTime() - new Date(a.ngayMua).getTime()),
    [items],
  );
  const filtered = useMemo(
    () => newestFirst.filter((item) => filter === "all" || (filter === "active" ? isActive(item) : isExpired(item))),
    [filter, newestFirst],
  );

  return (
    <section className="service-history" aria-labelledby="service-history-title">
      <div className="service-history-heading">
        <div>
          <div className="service-history-title-line">
            <h2 id="service-history-title">Lịch sử giao dịch trước đây</h2>
            <span className="service-history-count">{items.length} giao dịch</span>
          </div>
          <p>Theo dõi các gói đã mua, thời hạn sử dụng và trạng thái thanh toán.</p>
        </div>
        <div className="service-history-filters" role="group" aria-label="Lọc lịch sử giao dịch">
          {([ ["all", "Tất cả"], ["active", "Đang hoạt động"], ["expired", "Hết hạn"] ] as const).map(([value, label]) => (
            <button key={value} type="button" className={filter === value ? "is-selected" : ""} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="service-history-empty">
          {items.length === 0 ? "Bạn chưa có giao dịch mua gói dịch vụ." : "Không có giao dịch trong trạng thái này."}
        </div>
      ) : (
        <div className="service-history-table-wrap">
          <table className="service-history-table">
            <thead>
              <tr>
                <th>Mã giao dịch</th><th>Tên gói dịch vụ</th><th>Thời gian & hạn dùng</th>
                <th>Quyền lợi</th><th>Số tiền</th><th>Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const latestPayment = item.thanhToans[0];
                return (
                  <tr key={item.idMuaDichVu}>
                    <td className="service-history-id">#{item.idMuaDichVu}</td>
                    <td><strong>{item.tenDichVu}</strong><small>Mã gói: {item.idDichVu}</small></td>
                    <td>{dateLabel(item.ngayMua)}<small>{item.ngayHetHan ? `Hết hạn: ${dateLabel(item.ngayHetHan)}` : `${item.thoiGianDichVu} ngày`}</small></td>
                    <td>{item.thoiGianDichVu} ngày ưu tiên</td>
                    <td className="service-history-amount">{formatPrice(item.gia)}</td>
                    <td><span className={`service-payment-status ${latestPayment?.trangThai === "ThanhCong" ? "is-success" : latestPayment?.trangThai === "ThatBai" ? "is-failed" : ""}`}>
                      {paymentLabel(latestPayment?.trangThai ?? item.trangThai)}
                    </span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
