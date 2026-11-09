import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { baiDangApi } from "../../api/baiDang";
import { danhMucApi } from "../../api/danhMuc";
import AdminBulkBar from "../../components/admin/AdminBulkBar";
import AdminPostStats from "../../components/admin/AdminPostStats";
import AdminPostTable from "../../components/admin/AdminPostTable";
import AdminPostTabs, { type AdminPostTab } from "../../components/admin/AdminPostTabs";
import MaterialIcon from "../../components/common/MaterialIcon";
import { ErrorBox } from "../../components/common/State";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import type { BaiDangQuanTriResponse, DanhMuc, TrangThaiBaiDang } from "../../types";
import { getErrorMessage } from "../../utils/error";
import RejectPostDialog from "./RejectPostDialog";

function flattenCategories(categories: DanhMuc[], depth = 0): { id: number; label: string }[] {
  return categories.flatMap((category) => [
    { id: category.id, label: `${"— ".repeat(depth)}${category.tenDanhMuc}` },
    ...flattenCategories(category.danhMucCons ?? [], depth + 1),
  ]);
}

function getTab(value: string | null): AdminPostTab {
  if (value === "all") return "all";
  if (value === "DaDuyet" || value === "BiTuChoi" || value === "DaAn" || value === "DaBan") return value;
  return "ChoDuyet";
}

export default function AdminApprove() {
  useDocumentTitle("Quản lý tin đăng hệ thống");
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rejectingPosts, setRejectingPosts] = useState<BaiDangQuanTriResponse[] | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  const tab = getTab(searchParams.get("trangThai"));
  const status = tab === "all" ? undefined : tab as TrangThaiBaiDang;
  const list = useFetch(
    () => baiDangApi.quanTri({
      ...(status ? { trangThai: status } : {}),
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
      ...(categoryId ? { idDanhMuc: Number(categoryId) } : {}),
      page,
      pageSize,
    }),
    [status, debouncedKeyword, categoryId, page, pageSize],
  );
  const stats = useFetch(() => baiDangApi.thongKeQuanTri(), []);
  const categories = useFetch(() => danhMucApi.layCay(), []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    setSelectedIds([]);
  }, [tab, debouncedKeyword, categoryId, page, pageSize]);

  const reload = () => {
    list.reload();
    stats.reload();
  };

  const changeTab = (nextTab: AdminPostTab) => {
    const next = new URLSearchParams(searchParams);
    next.set("trangThai", nextTab);
    setSearchParams(next, { replace: true });
    setPage(1);
  };

  const processIds = async (ids: number[], action: (id: number) => Promise<void>, label: string) => {
    setBusy(true);
    let succeeded = 0;
    let failed = 0;
    for (const id of ids) {
      try {
        await action(id);
        succeeded += 1;
      } catch {
        failed += 1;
      }
    }
    setBusy(false);
    setSelectedIds([]);
    setRejectingPosts(null);
    toast(`${label}: thành công ${succeeded}, thất bại ${failed}.`, failed ? "error" : "ok");
    reload();
  };

  const approveOne = async (post: BaiDangQuanTriResponse) => {
    if (!window.confirm(`Xác nhận duyệt tin ${post.maTin} - "${post.tieuDe}"?`)) return;
    await processIds([post.id], (id) => baiDangApi.duyet(id), "Duyệt tin hoàn tất");
  };

  const reject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const reason = rejectReason.trim();
    if (!reason || !rejectingPosts) {
      toast("Vui lòng nhập lý do từ chối.", "error");
      return;
    }
    void processIds(
      rejectingPosts.map((post) => post.id),
      (id) => baiDangApi.tuChoi(id, { lyDo: reason }),
      "Từ chối tin hoàn tất",
    );
  };

  const openRejectDialog = (posts: BaiDangQuanTriResponse[]) => {
    setRejectingPosts(posts);
    setRejectReason("");
  };

  const categoryOptions = flattenCategories(categories.data ?? []);
  const selectedPosts = (list.data?.items ?? []).filter((post) => selectedIds.includes(post.id));

  return (
    <div className="space-y-space-2xl">
      <header className="flex flex-wrap items-start justify-between gap-space-lg">
        <div>
          <h1 className="admin-page-title">Quản lý tin đăng hệ thống</h1>
          <p className="mb-0 mt-space-xs text-body-2 text-on-surface-variant">
            Theo dõi, kiểm duyệt và quản lý trạng thái tin đăng trên toàn hệ thống.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-space-xs rounded-lg border border-outline-variant bg-surface-container-lowest px-space-lg py-space-sm font-button-text text-button-text text-on-surface hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
          onClick={reload}
          disabled={list.loading || stats.loading}
        >
          <MaterialIcon name="refresh" size={18} />
          Làm mới dữ liệu
        </button>
      </header>

      <AdminPostStats stats={stats.data} loading={stats.loading} />
      {stats.error && <ErrorBox message={stats.error} onRetry={stats.reload} />}
      {categories.error && <ErrorBox message={categories.error} onRetry={categories.reload} />}

      <AdminPostTabs value={tab} stats={stats.data} onChange={changeTab} />

      <section className="flex flex-wrap items-end gap-space-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-space-lg">
        <label className="min-w-[220px] flex-1 space-y-space-xs text-caption-bold text-on-surface-variant" htmlFor="admin-post-search">
          Tìm tin đăng
          <span className="relative block">
            <MaterialIcon name="search" size={20} className="absolute left-space-sm top-1/2 -translate-y-1/2 text-outline" />
            <input
              id="admin-post-search"
              type="search"
              value={keyword}
              onChange={(event) => { setKeyword(event.target.value); setPage(1); }}
              placeholder="Mã tin, tiêu đề, người đăng hoặc SĐT"
              className="w-full rounded-lg border border-outline-variant bg-surface px-space-3xl py-space-sm pl-10 font-body-2 text-body-2 text-on-surface outline-none focus:border-primary"
            />
          </span>
        </label>
        <label className="min-w-[220px] space-y-space-xs text-caption-bold text-on-surface-variant" htmlFor="admin-post-category">
          Danh mục
          <select
            id="admin-post-category"
            value={categoryId}
            onChange={(event) => { setCategoryId(event.target.value); setPage(1); }}
            className="block w-full rounded-lg border border-outline-variant bg-surface px-space-md py-space-sm font-body-2 text-body-2 text-on-surface outline-none focus:border-primary"
          >
            <option value="">Tất cả danh mục</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
        </label>
      </section>

      {selectedPosts.length > 0 && (
        <AdminBulkBar
          selectedCount={selectedPosts.length}
          disabled={busy || list.loading}
          onApprove={() => void processIds(selectedPosts.map((post) => post.id), (id) => baiDangApi.duyet(id), "Duyệt tin hoàn tất")}
          onReject={() => openRejectDialog(selectedPosts)}
        />
      )}

      <AdminPostTable
        items={list.data?.items ?? []}
        totalCount={list.data?.totalCount ?? 0}
        page={page}
        pageSize={pageSize}
        totalPages={list.data?.totalPages ?? 0}
        loading={list.loading}
        error={list.error}
        selectedIds={selectedIds}
        busy={busy}
        onRetry={list.reload}
        onPageChange={setPage}
        onPageSizeChange={(value) => { setPageSize(value); setPage(1); }}
        onSelectionChange={setSelectedIds}
        onApprove={(post) => void approveOne(post)}
        onReject={(post) => openRejectDialog([post])}
      />

      {rejectingPosts && (
        <RejectPostDialog
          posts={rejectingPosts}
          reason={rejectReason}
          busy={busy}
          onReasonChange={setRejectReason}
          onCancel={() => setRejectingPosts(null)}
          onSubmit={reject}
        />
      )}
    </div>
  );
}
