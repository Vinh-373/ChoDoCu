import { useState } from "react";
import { thongBaoApi } from "../../api/thongBao";
import Pagination from "../../components/common/Pagination";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useNotifications } from "../../contexts/NotificationContext";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/error";
import { timeAgo } from "../../utils/format";

export default function Notifications() {
  useDocumentTitle("Thông báo");
  const toast = useToast();
  const { refresh } = useNotifications();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(() => thongBaoApi.danhSach(page, 15), [page]);

  const markRead = async (id: number) => {
    try {
      await thongBaoApi.daDoc(id);
      reload();
      void refresh();
    } catch (err) {
      toast(getErrorMessage(err), "error");
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Thông báo</h1>
      </div>
      {loading && !data ? (
        <Spinner />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <Empty title="Chưa có thông báo nào">Khi tin của bạn được duyệt hoặc có người nhắn, thông báo sẽ hiện ở đây.</Empty>
      ) : (
        <>
          <ul className="list panel">
            {data.items.map((n) => {
              const unread = n.trangThai === "ChuaDoc";
              return (
                <li key={n.id} className={`list-item ${unread ? "is-unread" : ""}`}>
                  <span className="dot" aria-hidden="true" />
                  <div style={{ flex: 1 }}>
                    <strong>{n.tieuDe}</strong>
                    {n.noiDung && <p className="muted">{n.noiDung}</p>}
                    <span className="hint">{timeAgo(n.ngayTao)}</span>
                  </div>
                  {unread && (
                    <button className="btn btn-ghost btn-sm" onClick={() => void markRead(n.id)}>
                      Đánh dấu đã đọc
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}
