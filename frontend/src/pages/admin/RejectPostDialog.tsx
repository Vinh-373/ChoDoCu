import type { FormEvent } from "react";
import type { BaiDangQuanTriResponse } from "../../types";

interface Props {
  posts: BaiDangQuanTriResponse[];
  reason: string;
  busy: boolean;
  onReasonChange: (reason: string) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function RejectPostDialog({
  posts, reason, busy, onReasonChange, onCancel, onSubmit,
}: Props) {
  const multiple = posts.length > 1;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/50 p-space-lg"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <section
        className="w-full max-w-xl rounded-2xl bg-surface-container-lowest p-space-xl shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-post-title"
      >
        <div className="mb-space-lg">
          <h2 id="reject-post-title" className="m-0 font-headline-2 text-headline-2 text-on-surface">
            {multiple ? `Từ chối ${posts.length} bài đăng` : "Từ chối bài đăng"}
          </h2>
          <ul className="mb-0 mt-space-sm max-h-32 space-y-space-2xs overflow-y-auto pl-space-lg text-body-2 text-on-surface-variant">
            {posts.map((post) => <li key={post.id}>{post.maTin} · {post.tieuDe}</li>)}
          </ul>
        </div>
        <form className="space-y-space-lg" onSubmit={onSubmit}>
          <label className="block space-y-space-xs font-caption-bold text-caption-bold text-on-surface-variant" htmlFor="reject-reason">
            <span>Lý do từ chối (dùng chung cho các tin đã chọn)</span>
            <textarea
              id="reject-reason"
              required
              maxLength={1000}
              rows={5}
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              className="block w-full resize-y rounded-lg border border-outline-variant bg-surface px-space-md py-space-sm font-body-2 text-body-2 text-on-surface outline-none focus:border-primary"
            />
          </label>
          <div className="text-right text-caption text-on-surface-variant">{reason.length}/1000 ký tự</div>
          <div className="flex justify-end gap-space-sm">
            <button
              type="button"
              className="rounded-lg border border-outline-variant px-space-lg py-space-sm font-button-text text-button-text text-on-surface hover:bg-surface-container-low disabled:opacity-50"
              disabled={busy}
              onClick={onCancel}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-lg bg-error px-space-lg py-space-sm font-button-text text-button-text text-on-error hover:opacity-90 disabled:opacity-50"
              disabled={busy}
            >
              {busy ? "Đang xử lý…" : "Xác nhận từ chối"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
