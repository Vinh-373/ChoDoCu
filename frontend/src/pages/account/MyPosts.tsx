import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { baiDangApi } from "../../api/baiDang";
import { danhMucApi } from "../../api/danhMuc";
import ConfirmDialog from "../../components/account/ConfirmDialog";
import MyPostItem from "../../components/account/MyPostItem";
import PostFilters, { type PostSort } from "../../components/account/PostFilters";
import PostStatusTabs, { type PostTabKey } from "../../components/account/PostStatusTabs";
import MaterialIcon from "../../components/common/MaterialIcon";
import Pagination from "../../components/common/Pagination";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import usePostActions, { type PostAction } from "../../hooks/usePostActions";
import { useFetch } from "../../hooks/useFetch";
import useQuota from "../../hooks/useQuota";
import type { BaiDangCuaToiResponse, DanhMuc, PagedResult, ThongKeBaiDangResponse, TrangThaiBaiDang } from "../../types";
import { getErrorMessage } from "../../utils/error";

const PAGE_SIZE = 5;
const STATUSES: TrangThaiBaiDang[] = ["DaDuyet", "ChoDuyet", "DaAn", "BiTuChoi", "DaBan"];
const SORTS: PostSort[] = ["moiNhat", "cuNhat", "giaTang", "giaGiam", "xemNhieu"];
const CONFIRM_ACTIONS: Partial<Record<PostAction, { title: string; message: string; confirmLabel: string }>> = {
  an: { title: "Ẩn tin đăng?", message: "Tin sẽ không còn hiển thị với người mua.", confirmLabel: "Ẩn tin" },
  daBan: { title: "Đánh dấu đã bán?", message: "Tin sẽ chuyển sang trạng thái đã bán.", confirmLabel: "Đánh dấu đã bán" },
  huyDang: { title: "Hủy đăng tin?", message: "Bạn có chắc muốn hủy tin đang chờ duyệt?", confirmLabel: "Hủy đăng" },
  xoa: { title: "Xóa tin đăng?", message: "Tin sẽ được xóa khỏi danh sách quản lý.", confirmLabel: "Xóa tin" },
};

function getTab(value: string | null): PostTabKey {
  return value && STATUSES.includes(value as TrangThaiBaiDang) ? value as TrangThaiBaiDang : "all";
}

function getSort(value: string | null): PostSort {
  return value && SORTS.includes(value as PostSort) ? value as PostSort : "moiNhat";
}

function categoryLabels(tree: DanhMuc[]): Map<string, string> {
  const labels = new Map<string, string>();
  const visit = (categories: DanhMuc[], parent = "") => {
    for (const category of categories) {
      const label = parent ? `${parent} > ${category.tenDanhMuc}` : category.tenDanhMuc;
      labels.set(category.tenDanhMuc.trim().toLocaleLowerCase(), label);
      visit(category.danhMucCons ?? [], label);
    }
  };
  visit(tree);
  return labels;
}

function actionPrompt(action: PostAction, luotDang: number, luotDay: number, quotaKnown: boolean) {
  if (action === "dayTin") {
    return {
      title: "Đẩy tin VIP?",
      message: quotaKnown ? `Dùng 1 lượt đẩy, bạn còn ${Math.max(0, luotDay - 1)} lượt.` : "Dùng 1 lượt đẩy tin.",
      confirmLabel: "Đẩy tin VIP",
    };
  }
  if (action === "giaHan") {
    return {
      title: "Gia hạn tin đăng?",
      message: quotaKnown
        ? `Dùng 1 lượt đăng, gia hạn thêm 30 ngày. Bạn còn ${Math.max(0, luotDang - 1)} lượt đăng.`
        : "Dùng 1 lượt đăng, gia hạn thêm 30 ngày.",
      confirmLabel: "Gia hạn",
    };
  }
  return CONFIRM_ACTIONS[action];
}

export default function MyPosts() {
  useDocumentTitle("Tin đăng của tôi");
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [result, setResult] = useState<PagedResult<BaiDangCuaToiResponse> | null>(null);
  const [stats, setStats] = useState<ThongKeBaiDangResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirming, setConfirming] = useState<{ post: BaiDangCuaToiResponse; action: PostAction } | null>(null);
  const [quotaDialogOpen, setQuotaDialogOpen] = useState(false);
  const categories = useFetch(() => danhMucApi.layCay(), []);
  const quota = useQuota();

  const tab = getTab(searchParams.get("trangThai"));
  const sort = getSort(searchParams.get("sapXep"));
  const categoryIdValue = Number(searchParams.get("idDanhMuc"));
  const categoryId = Number.isInteger(categoryIdValue) && categoryIdValue > 0 ? categoryIdValue : undefined;
  const pageValue = Number(searchParams.get("page"));
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const queryKeyword = searchParams.get("keyword") ?? "";
  const lastQueryKeyword = useRef(queryKeyword);

  const updateQuery = useCallback((updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (queryKeyword !== lastQueryKeyword.current) {
      lastQueryKeyword.current = queryKeyword;
      setKeyword(queryKeyword);
    }
  }, [queryKeyword]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (keyword !== queryKeyword) updateQuery({ keyword: keyword.trim() || undefined, page: undefined });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [keyword, queryKeyword, updateQuery]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([
      baiDangApi.cuaToi({
        ...(tab !== "all" ? { trangThai: tab } : {}),
        ...(queryKeyword.trim() ? { keyword: queryKeyword.trim() } : {}),
        ...(categoryId ? { idDanhMuc: categoryId } : {}),
        sapXep: sort,
        page,
        pageSize: PAGE_SIZE,
      }),
      baiDangApi.thongKeCuaToi(),
    ]).then(([list, summary]) => {
      if (!active) return;
      setResult(list);
      setStats(summary);
      setLoading(false);
    }).catch((reason: unknown) => {
      if (!active) return;
      setError(getErrorMessage(reason, "Không tải được tin đăng. Vui lòng thử lại."));
      setLoading(false);
    });
    return () => { active = false; };
  }, [tab, queryKeyword, categoryId, sort, page, refreshKey]);

  const reload = useCallback(() => setRefreshKey((value) => value + 1), []);
  const refreshAfterAction = useCallback(() => {
    reload();
    quota.reload();
  }, [quota.reload, reload]);
  const { busyIds, perform } = usePostActions({ onSuccess: refreshAfterAction });
  const counts = useMemo(() => {
    const countByStatus = new Map((stats?.theoTrangThai ?? []).map((item) => [item.trangThai, item.soLuong]));
    return {
      all: stats?.tongSo ?? 0,
      DaDuyet: countByStatus.get("DaDuyet") ?? 0,
      ChoDuyet: countByStatus.get("ChoDuyet") ?? 0,
      DaAn: countByStatus.get("DaAn") ?? 0,
      BiTuChoi: countByStatus.get("BiTuChoi") ?? 0,
      DaBan: countByStatus.get("DaBan") ?? 0,
    };
  }, [stats]);
  const labels = useMemo(() => categoryLabels(categories.data ?? []), [categories.data]);
  const posts = result?.items ?? [];
  const totalPages = Math.max(1, result?.totalPages ?? 1);
  const firstItem = result && result.totalCount > 0 ? (result.page - 1) * PAGE_SIZE + 1 : 0;
  const lastItem = result ? Math.min((result.page - 1) * PAGE_SIZE + posts.length, result.totalCount) : 0;

  const handleAction = (post: BaiDangCuaToiResponse, action: PostAction) => {
    if (action === "dayTin" && !quota.loading && !quota.error && quota.luotDay === 0) {
      setQuotaDialogOpen(true);
    } else if (actionPrompt(action, quota.luotDang, quota.luotDay, !quota.loading && !quota.error)) setConfirming({ post, action });
    else void perform(action, post.id);
  };

  const confirmAction = async () => {
    if (!confirming) return;
    const succeeded = await perform(confirming.action, confirming.post.id);
    if (succeeded !== undefined) setConfirming(null);
  };

  const selectTab = (nextTab: PostTabKey) => {
    updateQuery({ trangThai: nextTab === "all" ? undefined : nextTab, page: undefined });
  };
  const selectCategory = (value: number | undefined) => updateQuery({ idDanhMuc: value?.toString(), page: undefined });
  const selectSort = (value: PostSort) => updateQuery({ sapXep: value === "moiNhat" ? undefined : value, page: undefined });

  const cards = [
    { label: "Tổng tin đăng", value: counts.all, icon: "list_alt", note: "Tất cả mục" },
    { label: "Đang hiển thị", value: counts.DaDuyet, icon: "check_circle", note: "Đang tiếp cận khách", accent: "text-secondary" },
    { label: "Đang chờ duyệt", value: counts.ChoDuyet, icon: "schedule", note: "Chờ kiểm duyệt", accent: "text-tertiary" },
    { label: "Bị từ chối", value: counts.BiTuChoi, icon: "report", note: "Lý do từ chối", accent: "text-error" },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-space-lg pb-space-xl">
      <div className="flex items-center justify-between gap-space-md">
        <div>
          <h1 className="m-0 font-headline-1 text-headline-1 text-on-surface">Tin đăng của tôi</h1>
          <p className="mb-0 mt-space-xs font-caption text-caption text-on-surface-variant">
            {quota.loading ? "Đang tải lượt sử dụng…" : `Còn ${quota.luotDang} lượt đăng · ${quota.luotDay} lượt đẩy`}
            {" · "}
            <Link to="/dich-vu" className="font-caption-bold text-caption-bold text-primary underline">Mua thêm lượt</Link>
          </p>
          {quota.error && <p className="mb-0 mt-space-2xs font-caption text-caption text-error" role="alert">{quota.error}</p>}
        </div>
        <Link to="/dang-tin" className="inline-flex items-center gap-space-xs h-10 px-space-lg rounded-xl bg-primary-container hover:bg-primary text-on-primary no-underline hover:no-underline font-button-text text-button-text shadow-md transition-colors">
          <MaterialIcon name="add_circle" size={18} /> Đăng tin mới
        </Link>
      </div>

      {loading ? <Spinner /> : error ? <ErrorBox message={error} onRetry={reload} /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
            {cards.map((card) => (
              <div key={card.label} className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-space-md flex flex-col gap-space-2xs">
                <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant">
                  <span>{card.label}</span><MaterialIcon name={card.icon} size={18} className={card.accent} />
                </div>
                <strong className="font-headline-1 text-headline-1 text-on-surface">{card.value}</strong>
                <span className="font-caption text-caption text-on-surface-variant">{card.note}</span>
              </div>
            ))}
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-space-md flex flex-col gap-space-md">
            <PostStatusTabs value={tab} counts={counts} onChange={selectTab} />
            <PostFilters
              keyword={keyword}
              categoryId={categoryId}
              sort={sort}
              categories={categories.data ?? []}
              categoryError={categories.error}
              onKeywordChange={setKeyword}
              onCategoryChange={selectCategory}
              onSortChange={selectSort}
            />
          </div>

          {posts.length === 0 ? (
            <Empty title={queryKeyword || categoryId || tab !== "all" ? "Không có tin nào khớp bộ lọc" : "Bạn chưa có tin đăng nào"}>
              {queryKeyword || categoryId || tab !== "all" ? "Thử đổi trạng thái, danh mục hoặc từ khóa tìm kiếm." : <><Link to="/dang-tin">Đăng tin đầu tiên</Link> để bắt đầu bán đồ cũ.</>}
            </Empty>
          ) : (
            <div className="flex flex-col gap-space-md">
              {posts.map((post) => (
                <MyPostItem
                  key={post.id}
                  post={post}
                  categoryLabel={labels.get(post.tenDanhMuc.trim().toLocaleLowerCase()) ?? post.tenDanhMuc}
                  busy={busyIds.has(post.id)}
                  onAction={(action) => handleAction(post, action)}
                />
              ))}
            </div>
          )}

          {result && result.totalCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-space-md font-caption text-caption text-on-surface-variant">
              <span>
                Hiển thị {firstItem} - {lastItem} trong tổng số {result.totalCount} tin đăng
              </span>
              <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} onChange={(nextPage) => updateQuery({ page: nextPage === 1 ? undefined : String(nextPage) })} />
            </div>
          )}
        </>
      )}

      {confirming && (() => {
        const prompt = actionPrompt(confirming.action, quota.luotDang, quota.luotDay, !quota.loading && !quota.error);
        if (!prompt) return null;
        return (
          <ConfirmDialog
            {...prompt}
            busy={busyIds.has(confirming.post.id)}
            onCancel={() => setConfirming(null)}
            onConfirm={() => void confirmAction()}
          />
        );
      })()}
      {quotaDialogOpen && (
        <ConfirmDialog
          title="Bạn đã hết lượt đẩy tin"
          message="Mua thêm lượt đẩy để tiếp tục đẩy tin VIP."
          confirmLabel="Đến dịch vụ"
          linkTo="/dich-vu"
          onCancel={() => setQuotaDialogOpen(false)}
        />
      )}
    </div>
  );
}
