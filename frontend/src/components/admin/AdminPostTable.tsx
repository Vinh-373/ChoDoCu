import { useMemo } from "react";
import type { BaiDangQuanTriResponse } from "../../types";
import AdminPostRow from "./AdminPostRow";
import Pagination from "../common/Pagination";
import { Empty, ErrorBox, Spinner } from "../common/State";

interface Props {
  items: BaiDangQuanTriResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  selectedIds: number[];
  busy: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelectionChange: (ids: number[]) => void;
  onApprove: (post: BaiDangQuanTriResponse) => void;
  onReject: (post: BaiDangQuanTriResponse) => void;
}

export default function AdminPostTable({
  items, totalCount, page, pageSize, totalPages, loading, error, selectedIds, busy,
  onRetry, onPageChange, onPageSizeChange, onSelectionChange, onApprove, onReject,
}: Props) {
  const selectableIds = useMemo(() => items.filter((post) => post.trangThai === "ChoDuyet").map((post) => post.id), [items]);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));
  const firstItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalCount);

  const toggleAll = (checked: boolean) => {
    onSelectionChange(checked ? Array.from(new Set([...selectedIds, ...selectableIds])) : selectedIds.filter((id) => !selectableIds.includes(id)));
  };

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      {loading && !items.length ? (
        <Spinner label="Đang tải danh sách tin đăng…" />
      ) : error ? (
        <ErrorBox message={error} onRetry={onRetry} />
      ) : items.length === 0 ? (
        <Empty title="Không tìm thấy tin đăng" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-surface-container-low text-caption-bold text-on-surface-variant">
              <tr>
                <th className="w-10 px-space-md py-space-md">
                  <input
                    type="checkbox"
                    aria-label="Chọn tất cả tin chờ duyệt trên trang"
                    checked={allSelected}
                    disabled={selectableIds.length === 0 || busy}
                    onChange={(event) => toggleAll(event.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                </th>
                <th className="px-space-md py-space-md">Ảnh / Mã tin</th>
                <th className="px-space-md py-space-md">Tiêu đề / Danh mục</th>
                <th className="px-space-md py-space-md">Người đăng</th>
                <th className="px-space-md py-space-md">Giá</th>
                <th className="px-space-md py-space-md">Thời gian gửi</th>
                <th className="px-space-md py-space-md">Trạng thái</th>
                <th className="px-space-md py-space-md">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map((post) => (
                <AdminPostRow
                  key={post.id}
                  post={post}
                  selected={selectedIds.includes(post.id)}
                  busy={busy}
                  onToggle={(id, checked) => onSelectionChange(checked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id))}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!error && !loading && (
        <footer className="flex flex-wrap items-center justify-between gap-space-md border-t border-surface-variant px-space-lg py-space-md">
          <p className="m-0 text-caption text-on-surface-variant">
            Hiển thị {firstItem}–{lastItem} trên tổng số {totalCount.toLocaleString("vi-VN")}
          </p>
          <div className="flex flex-wrap items-center gap-space-lg">
            <label className="flex items-center gap-space-xs text-caption text-on-surface-variant">
              Số dòng
              <select
                value={pageSize}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                className="rounded-lg border border-outline-variant bg-surface px-space-sm py-space-xs text-on-surface"
              >
                {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
          </div>
        </footer>
      )}
    </section>
  );
}
