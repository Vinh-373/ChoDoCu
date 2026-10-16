import { useState } from "react";
import { yeuThichApi } from "../../api/yeuThich";
import Pagination from "../../components/common/Pagination";
import PostCard from "../../components/common/PostCard";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";

export default function Favorites() {
  useDocumentTitle("Tin đã lưu");
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(() => yeuThichApi.danhSach(page, 12), [page]);

  return (
    <>
      <div className="page-head">
        <h1>Tin đã lưu</h1>
        {data && <span className="muted">{data.totalCount} tin</span>}
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <Empty title="Bạn chưa lưu tin nào">Bấm biểu tượng trái tim trên tin đăng để lưu lại xem sau.</Empty>
      ) : (
        <>
          <div className="grid-posts">
            {data.items.map((f) => (
              <PostCard key={f.id} id={f.idBaiDang} tieuDe={f.tieuDe} giaTien={f.giaTien} anh={f.anhDaiDien} ngay={f.ngayTao} />
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}
