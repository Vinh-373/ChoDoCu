import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { baiDangApi } from "../../api/baiDang";
import { danhMucApi } from "../../api/danhMuc";
import { timKiemApi } from "../../api/timKiem";
import CategorySelect from "../../components/common/CategorySelect";
import LocationFields from "../../components/common/LocationFields";
import Pagination from "../../components/common/Pagination";
import PostCard from "../../components/common/PostCard";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useAuth } from "../../contexts/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";

const PAGE_SIZE = 12;

export default function PostSearch() {
  useDocumentTitle("Tìm kiếm");
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const tuKhoa = params.get("q") ?? "";
  const idDanhMuc = params.get("danhMuc") ? Number(params.get("danhMuc")) : undefined;
  const idThanhPho = params.get("thanhPho") ? Number(params.get("thanhPho")) : undefined;
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [kw, setKw] = useState(tuKhoa);
  useEffect(() => setKw(tuKhoa), [tuKhoa]);

  const tree = useFetch(() => danhMucApi.cay(), []);
  const history = useFetch(() => (user ? timKiemApi.lichSu(8) : Promise.resolve([])), [user?.idNguoiDung]);
  const result = useFetch(
    () => baiDangApi.tim({ tuKhoa: tuKhoa || undefined, idDanhMuc, idThanhPho, page, pageSize: PAGE_SIZE }),
    [tuKhoa, idDanhMuc, idThanhPho, page],
  );

  /** Đổi bộ lọc luôn đưa về trang 1. */
  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    update({ q: kw.trim() || undefined });
  };

  const items = result.data?.items ?? [];
  const uniqueHistory = Array.from(new Set((history.data ?? []).map((h) => h.tuKhoa)));
  const hasFilter = Boolean(tuKhoa || idDanhMuc || idThanhPho);

  return (
    <>
      <div className="page-head">
        <h1>{tuKhoa ? `Kết quả cho “${tuKhoa}”` : "Tất cả tin đăng"}</h1>
        {result.data && <span className="muted">{result.data.totalCount} tin</span>}
      </div>

      <div className="search-layout">
        <aside className="filters panel stack" aria-label="Bộ lọc">
          <form className="field" onSubmit={submit}>
            <label htmlFor="kw">Từ khoá</label>
            <input id="kw" type="search" value={kw} onChange={(e) => setKw(e.target.value)} placeholder="Ví dụ: iPhone 12" />
            <button className="btn btn-sm">Tìm</button>
          </form>

          {uniqueHistory.length > 0 && (
            <div className="field">
              <span className="label">Bạn đã tìm gần đây</span>
              <div className="history">
                {uniqueHistory.map((h) => (
                  <button key={h} type="button" className="chip" onClick={() => update({ q: h })}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="dm">Danh mục</label>
            <CategorySelect id="dm" tree={tree.data ?? []} value={idDanhMuc} onChange={(id) => update({ danhMuc: id ? String(id) : undefined })} />
          </div>

          <div className="field">
            <span className="label">Khu vực</span>
            <LocationFields
              idThanhPho={idThanhPho}
              idPhuongXa={undefined}
              showWard={false}
              onChange={(v) => update({ thanhPho: v.idThanhPho ? String(v.idThanhPho) : undefined })}
            />
          </div>

          {hasFilter && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setParams(new URLSearchParams())}>
              Xoá bộ lọc
            </button>
          )}
        </aside>

        <section aria-live="polite">
          {result.loading ? (
            <Spinner />
          ) : result.error ? (
            <ErrorBox message={result.error} onRetry={result.reload} />
          ) : items.length === 0 ? (
            <Empty title="Không có tin nào phù hợp">Thử bỏ bớt bộ lọc hoặc dùng từ khoá ngắn hơn.</Empty>
          ) : (
            <>
              <div className="grid-posts">
                {items.map((p) => (
                  <PostCard key={p.id} id={p.id} tieuDe={p.tieuDe} giaTien={p.giaTien} anh={p.anhs[0]} noiTrongTin={p.tenThanhPho} ngay={p.ngayDang} />
                ))}
              </div>
              <Pagination
                page={result.data!.page}
                totalPages={result.data!.totalPages}
                onChange={(p) => {
                  update({ page: p > 1 ? String(p) : undefined });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}
