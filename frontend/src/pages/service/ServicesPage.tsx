import { useState } from "react";
import { dichVuApi } from "../../api/dichVu";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/error";
import { formatPrice } from "../../utils/format";
import type { MuaDichVuResponse } from "../../types";
import { useNavigate } from "react-router-dom";

const METHODS = ["MoMo", "VNPay", "ChuyenKhoan"];

export default function ServicesPage() {
  useDocumentTitle("Dịch vụ đẩy tin");
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => dichVuApi.danhSach(), []);
  const [method, setMethod] = useState(METHODS[0]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [order, setOrder] = useState<MuaDichVuResponse | null>(null);

  const buy = async (id: number) => {
    if (!user) {
      toast("Đăng nhập để mua dịch vụ.", "info");
      return navigate("/dang-nhap", { state: { from: "/dich-vu" } });
    }
    setBusyId(id);
    try {
      setOrder(await dichVuApi.mua(id, method));
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirm = async (ok: boolean) => {
    if (!order) return;
    try {
      await dichVuApi.xacNhan(order.idThanhToan, ok);
      toast(ok ? "Thanh toán thành công." : "Đã ghi nhận thanh toán thất bại.", ok ? "ok" : "info");
      setOrder(null);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Dịch vụ đẩy tin</h1>
      </div>
      <p className="muted" style={{ marginBottom: 16 }}>Chọn gói để tin của bạn được ưu tiên hiển thị lâu hơn.</p>

      {order && (
        <div className="alert panel stack" role="status">
          <strong>Đơn #{order.idMuaDichVu}: {order.tenDichVu} — {formatPrice(order.tongTien)}</strong>
          <span className="hint">
            Đây là bước thử nghiệm: ở bản chạy thật, kết quả thanh toán do cổng thanh toán báo về máy chủ, không bấm từ trình duyệt.
          </span>
          <div className="row">
            <button className="btn btn-ok btn-sm" onClick={() => void confirm(true)}>Giả lập thanh toán thành công</button>
            <button className="btn btn-danger btn-sm" onClick={() => void confirm(false)}>Giả lập thất bại</button>
          </div>
        </div>
      )}

      <div className="field" style={{ maxWidth: 260, marginBottom: 16 }}>
        <label htmlFor="pt">Phương thức thanh toán</label>
        <select id="pt" value={method} onChange={(e) => setMethod(e.target.value)}>
          {METHODS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <Empty title="Chưa có gói dịch vụ nào" />
      ) : (
        <div className="plans">
          {data.map((d) => (
            <div key={d.id} className="plan">
              <h3>{d.tenDichVu}</h3>
              <span className="price-tag price-tag-lg">{formatPrice(d.gia)}</span>
              <p className="muted">{d.thoiGianDichVu} ngày hiển thị ưu tiên</p>
              <button className="btn btn-sticker btn-block" disabled={busyId === d.id} onClick={() => void buy(d.id)}>
                {busyId === d.id ? "Đang tạo đơn…" : "Mua gói này"}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
