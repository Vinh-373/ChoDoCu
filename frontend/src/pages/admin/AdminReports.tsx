import { useState } from "react";
import { Link } from "react-router-dom";
import { baoCaoApi } from "../../api/baoCao";
import Pagination from "../../components/common/Pagination";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/format";

const FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "ChoXuLy", label: "Chờ xử lý" },
  { value: "DaXuLy", label: "Đã xử lý" },
  { value: "BoQua", label: "Bỏ qua" },
];

export default function AdminReports() {
  useDocumentTitle("Báo cáo vi phạm");
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(() => baoCaoApi.danhSach(status || undefined, page, 15), [status, page]);

  const handle = async (id: number, to: "DaXuLy" | "BoQua") => {
    try {
      await baoCaoApi.xuLy(id, to);
      toast("Đã cập nhật báo cáo.", "ok");
      reload();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="stack">
      <h1 className="admin-page-title">Báo cáo vi phạm</h1>
      <div className="field" style={{ maxWidth: 220 }}>
        <label htmlFor="st">Trạng thái</label>
        <select id="st" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {loading && !data ? (
        <Spinner />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <Empty title="Không có báo cáo nào" />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Tin đăng</th><th>Người báo cáo</th><th>Nội dung</th><th>Ngày</th><th>Trạng thái</th><th /></tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id}>
                    <td><Link to={`/bai-dang/${r.idBaiDang}`}>{r.tieuDeBaiDang}</Link></td>
                    <td>{r.tenNguoiBaoCao}</td>
                    <td>{r.noiDung}</td>
                    <td>{formatDateTime(r.ngayTao)}</td>
                    <td><span className="badge">{r.trangThai}</span></td>
                    <td className="row">
                      <button className="btn btn-ok btn-sm" onClick={() => void handle(r.id, "DaXuLy")}>Đã xử lý</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => void handle(r.id, "BoQua")}>Bỏ qua</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
