import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { baiDangApi } from "../../api/baiDang";
import MyPostItem from "../../components/account/MyPostItem";
import MaterialIcon from "../../components/common/MaterialIcon";
import Pagination from "../../components/common/Pagination";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import type { TrangThaiBaiDang } from "../../types";
import { getErrorMessage } from "../../utils/error";

const PAGE_SIZE = 10;

type TabKey = "all" | TrangThaiBaiDang;
const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "DaDuyet", label: "Đang hiển thị" },
  { key: "ChoDuyet", label: "Chờ duyệt" },
  { key: "TuChoi", label: "Cần chỉnh sửa" },
  { key: "DaAn", label: "Đã ẩn" },
];

/** Quản lý tin đăng của tôi (/tin-cua-toi): thống kê, tab theo trạng thái, tìm kiếm, ẩn/hiện tin. */
export default function MyPosts() {
  useDocumentTitle("Tin đăng của tôi");
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => baiDangApi.cuaToi(1, 100), []);
  const [tab, setTab] = useState<TabKey>("all");
  const [keyword, setKeyword] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());

  const posts = useMemo(() => data?.items ?? [], [data]);
  const count = (s: TabKey) => (s === "all" ? posts.length : posts.filter((p) => p.trangThai === s).length);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return posts
      .filter((p) => (tab === "all" || p.trangThai === tab) && (!kw || p.tieuDe.toLowerCase().includes(kw)))
      .sort((a, b) => (newestFirst ? 1 : -1) * (new Date(b.ngayDang).getTime() - new Date(a.ngayDang).getTime()));
  }, [posts, tab, keyword, newestFirst]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const mark = (ids: number[], on: boolean) => setBusyIds((cur) => new Set([...cur].filter((x) => !ids.includes(x)).concat(on ? ids : [])));

  const toggleHidden = async (id: number, hidden: boolean) => {
    mark([id], true);
    try {
      await (hidden ? baiDangApi.hien(id) : baiDangApi.an(id));
      toast(hidden ? "Đã hiện lại tin." : "Đã ẩn tin.", "ok");
      reload();
    } catch (err) {
      toast(getErrorMessage(err, "Chưa thực hiện được. Vui lòng thử lại."), "error");
    } finally {
      mark([id], false);
    }
  };

  const hideSelected = async () => {
    const ids = posts.filter((p) => selected.has(p.id) && p.trangThai === "DaDuyet").map((p) => p.id);
    if (ids.length === 0) return toast("Chỉ ẩn được các tin đang hiển thị.", "info");
    mark(ids, true);
    const results = await Promise.allSettled(ids.map((id) => baiDangApi.an(id)));
    const failed = results.filter((r) => r.status === "rejected").length;
    mark(ids, false);
    setSelected(new Set());
    toast(failed ? `Đã ẩn ${ids.length - failed}/${ids.length} tin, ${failed} tin lỗi.` : `Đã ẩn ${ids.length} tin.`, failed ? "error" : "ok");
    reload();
  };

  const pick = (id: number, on: boolean) =>
    setSelected((cur) => {
      const next = new Set(cur);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const stats = [
    { label: "Tổng tin đăng", value: count("all"), icon: "list_alt", note: "Tất cả mục" },
    { label: "Đang hiển thị", value: count("DaDuyet"), icon: "check_circle", note: "Đang tiếp cận khách", accent: "text-secondary" },
    { label: "Đang chờ duyệt", value: count("ChoDuyet"), icon: "schedule", note: "Chờ kiểm duyệt", accent: "text-tertiary" },
    { label: "Cần chỉnh sửa", value: count("TuChoi"), icon: "report", note: "Chưa được duyệt", accent: "text-error" },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-space-lg pb-space-xl">
      <div className="flex items-center justify-between gap-space-md">
        <h1 className="m-0 font-headline-1 text-headline-1 text-on-surface">Tin đăng của tôi</h1>
        <Link
          to="/dang-bai"
          className="inline-flex items-center gap-space-xs h-10 px-space-lg rounded-xl bg-primary-container hover:bg-primary text-on-primary no-underline hover:no-underline font-button-text text-button-text shadow-md transition-colors"
        >
          <MaterialIcon name="add_circle" size={18} /> Đăng tin mới
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-space-md flex flex-col gap-space-2xs">
                <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant">
                  <span>{s.label}</span>
                  <MaterialIcon name={s.icon} size={18} className={s.accent} />
                </div>
                <strong className="font-headline-1 text-headline-1 text-on-surface">{s.value}</strong>
                <span className="font-caption text-caption text-on-surface-variant">{s.note}</span>
              </div>
            ))}
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-space-md flex flex-col gap-space-md">
            <div role="tablist" aria-label="Lọc theo trạng thái" className="flex gap-space-lg overflow-x-auto border-b border-surface-variant">
              {TABS.map((t) => {
                const active = t.key === tab;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setTab(t.key);
                      setPage(1);
                    }}
                    className={`shrink-0 -mb-px pb-space-sm px-0 bg-transparent border-0 border-b-2 cursor-pointer inline-flex items-center gap-space-xs font-button-text text-button-text ${
                      active ? "border-primary-container text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {t.label}
                    <span className={`px-space-xs rounded-full font-caption-bold text-caption-bold ${active ? "bg-primary-fixed text-primary" : "bg-surface-container-high"}`}>{count(t.key)}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="relative flex-1 min-w-48 flex items-center">
                <MaterialIcon name="search" size={18} className="absolute left-space-md text-on-surface-variant pointer-events-none" />
                <input
                  type="search"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm kiếm theo tiêu đề tin"
                  aria-label="Tìm trong tin của tôi"
                  className="w-full h-10 pl-10 pr-space-md bg-surface-container-low rounded-xl border-0 font-body-2 text-body-2 focus:outline-none focus:shadow-[0_0_0_2px_#ff7a00]"
                />
              </div>
              <button
                type="button"
                onClick={() => setNewestFirst((v) => !v)}
                className="h-10 px-space-md rounded-xl border-0 cursor-pointer bg-surface-container-low hover:bg-surface-container font-button-text text-button-text text-on-surface inline-flex items-center gap-space-xs"
              >
                <MaterialIcon name="swap_vert" size={18} /> {newestFirst ? "Mới nhất" : "Cũ nhất"}
              </button>
              <button
                type="button"
                disabled={selected.size === 0}
                onClick={() => void hideSelected()}
                className="h-10 px-space-md rounded-xl border-0 cursor-pointer bg-surface-container-high hover:bg-surface-variant font-button-text text-button-text text-on-surface inline-flex items-center gap-space-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MaterialIcon name="visibility_off" size={18} /> Ẩn tin đã chọn{selected.size > 0 ? ` (${selected.size})` : ""}
              </button>
            </div>
          </div>

          {rows.length === 0 ? (
            posts.length === 0 ? (
              <Empty title="Bạn chưa có tin đăng nào">
                <Link to="/dang-bai">Đăng tin đầu tiên</Link> để bắt đầu bán đồ cũ.
              </Empty>
            ) : (
              <Empty title="Không có tin nào khớp bộ lọc">Thử đổi trạng thái hoặc từ khóa tìm kiếm.</Empty>
            )
          ) : (
            <div className="flex flex-col gap-space-md">
              {rows.map((p) => (
                <MyPostItem
                  key={p.id}
                  post={p}
                  selected={selected.has(p.id)}
                  busy={busyIds.has(p.id)}
                  onSelect={(on) => pick(p.id, on)}
                  onToggleHidden={() => void toggleHidden(p.id, p.trangThai === "DaAn")}
                />
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-space-md font-caption text-caption text-on-surface-variant">
              <span>
                Hiển thị {(current - 1) * PAGE_SIZE + 1} - {(current - 1) * PAGE_SIZE + rows.length} trong tổng số {filtered.length} tin đăng
              </span>
              <Pagination page={current} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
