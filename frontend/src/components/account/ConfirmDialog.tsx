import { Link } from "react-router-dom";
import MaterialIcon from "../common/MaterialIcon";

interface Props {
  title: string;
  message: string;
  busy?: boolean;
  confirmLabel?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  linkTo?: string;
}

export default function ConfirmDialog({
  title, message, busy = false, confirmLabel = "Xác nhận", onConfirm, onCancel, linkTo,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-space-md"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <section
        className="w-full max-w-md rounded-xl bg-surface-container-lowest p-space-lg shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-confirm-title"
        aria-describedby="post-confirm-message"
      >
        <h2 id="post-confirm-title" className="m-0 font-headline-3 text-headline-3 text-on-surface">{title}</h2>
        <p id="post-confirm-message" className="my-space-md font-body-2 text-body-2 text-on-surface-variant">{message}</p>
        <div className="flex justify-end gap-space-sm">
          <button type="button" disabled={busy} onClick={onCancel} className="h-10 rounded-lg bg-surface-container-high px-space-md font-button-text text-button-text text-on-surface disabled:opacity-60">
            Hủy
          </button>
          {linkTo ? (
            <Link to={linkTo} className="inline-flex h-10 items-center gap-space-xs rounded-lg bg-primary-container px-space-md font-button-text text-button-text text-on-primary no-underline">
              {confirmLabel}
            </Link>
          ) : (
            <button type="button" disabled={busy} onClick={onConfirm} className="inline-flex h-10 items-center gap-space-xs rounded-lg bg-error px-space-md font-button-text text-button-text text-on-error disabled:opacity-60">
              {busy && <MaterialIcon name="progress_activity" size={16} className="animate-spin" />}
              {busy ? "Đang xử lý…" : confirmLabel}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
