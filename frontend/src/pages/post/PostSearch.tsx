import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { baiDangApi } from "../../api/baiDang";
import { danhMucApi } from "../../api/danhMuc";
import { timKiemApi } from "../../api/timKiem";
import Pagination from "../../components/common/Pagination";
import PostCard from "../../components/common/PostCard";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import SearchFilters from "../../components/search/SearchFilters";
import SortSelect, { type SearchSort } from "../../components/search/SortSelect";
import { useAuth } from "../../contexts/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import type { TimBaiDangParams } from "../../types";

const PAGE_SIZE = 12;
const SEARCH_SORTS: SearchSort[] = ["uuTien", "moiNhat", "giaTang", "giaGiam", "xemNhieu"];

function readNumberParam(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export default function PostSearch() {
  useDocumentTitle("Tìm kiếm");
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const keyword = params.get("q") ?? "";
  const idDanhMuc = params.get("danhMuc") ? Number(params.get("danhMuc")) : undefined;
  const idThanhPho = params.get("thanhPho") ? Number(params.get("thanhPho")) : undefined;
  const idPhuongXa = params.get("phuongXa") ? Number(params.get("phuongXa")) : undefined;
  const giaTu = readNumberParam(params.get("giaTu"));
  const giaDen = readNumberParam(params.get("giaDen"));
  const sortParam = params.get("sapXep");
  const sapXep = SEARCH_SORTS.includes(sortParam as SearchSort) ? sortParam as SearchSort : "uuTien";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [kw, setKw] = useState(keyword);
  useEffect(() => setKw(keyword), [keyword]);

  const tree = useFetch(() => danhMucApi.cay(), []);
  const history = useFetch(() => (user ? timKiemApi.lichSu(8) : Promise.resolve([])), [user?.idNguoiDung]);
  const result = useFetch(
    () => {
      const searchParams: TimBaiDangParams = {
        keyword: keyword || undefined,
        idDanhMuc,
        idThanhPho,
        idPhuongXa,
        giaTu,
        giaDen,
        sapXep,
        page,
        pageSize: PAGE_SIZE,
      };
      return baiDangApi.tim(searchParams);
    },
    [keyword, idDanhMuc, idThanhPho, idPhuongXa, giaTu, giaDen, sapXep, page],
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
  const hasFilter = Boolean(
    keyword || idDanhMuc || idThanhPho || idPhuongXa || giaTu !== undefined || giaDen !== undefined || params.has("sapXep"),
  );

  return (
    <>
      <div className="page-head">
        <h1>{keyword ? `Kết quả cho “${keyword}”` : "Tất cả tin đăng"}</h1>
      </div>

      <div className="search-layout">
        <SearchFilters
          keyword={kw}
          onKeywordChange={setKw}
          onSubmit={submit}
          history={uniqueHistory}
          onHistorySelect={(value) => update({ q: value })}
          categories={tree.data ?? []}
          idDanhMuc={idDanhMuc}
          onCategoryChange={(id) => update({ danhMuc: id === undefined ? undefined : String(id) })}
          idThanhPho={idThanhPho}
          idPhuongXa={idPhuongXa}
          onLocationChange={(value) => update({
            thanhPho: value.idThanhPho === undefined ? undefined : String(value.idThanhPho),
            phuongXa: value.idPhuongXa === undefined ? undefined : String(value.idPhuongXa),
          })}
          giaTu={giaTu}
          giaDen={giaDen}
          onPriceChange={(range) => update({
            giaTu: range.giaTu === undefined ? undefined : String(range.giaTu),
            giaDen: range.giaDen === undefined ? undefined : String(range.giaDen),
          })}
          hasFilter={hasFilter}
          onClear={() => setParams(new URLSearchParams())}
        />

        <section aria-live="polite">
          <div className="mb-space-lg flex flex-wrap items-center justify-between gap-space-md">
            <span className="muted">
              {result.data ? `${result.data.totalCount} kết quả` : "Đang tìm kết quả..."}
            </span>
            <SortSelect value={sapXep} onChange={(value) => update({ sapXep: value })} />
          </div>
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
                  <PostCard
                    key={p.id}
                    id={p.id}
                    tieuDe={p.tieuDe}
                    giaTien={p.giaTien}
                    anh={p.anhBia ?? p.anhs[0]}
                    noiTrongTin={p.tenThanhPho}
                    ngay={p.ngayDang}
                    laTinUuTien={p.laTinUuTien}
                    ngayDayTin={p.ngayDayTin}
                  />
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
