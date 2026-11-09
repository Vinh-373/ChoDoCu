import type { FormEvent } from "react";
import type { TrangThaiBaiDang } from "../../types";
import { TRANG_THAI_BAI_DANG } from "../../utils/format";

export type ReviewChoice = "approve" | "reject";

interface Props {
  status: TrangThaiBaiDang;
  reason?: string | null;
  choice: ReviewChoice | null;
  rejectReason: string;
  busy: boolean;
  onChoiceChange: (choice: ReviewChoice) => void;
  onReasonChange: (reason: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function ReviewDecisionPanel({
  status, reason, choice, rejectReason, busy, onChoiceChange, onReasonChange, onSubmit,
}: Props) {
  if (status !== "ChoDuyet") {
    return (
      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <h2 className="mb-space-md mt-0 font-headline-3 text-headline-3 text-on-surface">Kết quả kiểm duyệt</h2>
        <p className="mb-0 font-caption-bold text-caption-bold text-on-surface">{TRANG_THAI_BAI_DANG[status] ?? status}</p>
        {status === "BiTuChoi" && reason && (
          <p className="mb-0 mt-space-sm whitespace-pre-line text-body-2 text-error">Lý do: {reason}</p>
        )}
      </section>
    );
  }

  const canSubmit = !busy && choice !== null &&
    (choice !== "reject" || Boolean(rejectReason.trim()));

  return (
    <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
      <h2 className="mb-space-md mt-0 font-headline-3 text-headline-3 text-on-surface">Bảng quyết định kiểm duyệt</h2>
      <form className="space-y-space-md" onSubmit={onSubmit}>
        <fieldset className="m-0 space-y-space-sm border-0 p-0">
          <legend className="mb-space-sm font-caption-bold text-caption-bold text-on-surface">Quyết định</legend>
          {([
            ["approve", "Phê duyệt"],
            ["reject", "Từ chối"],
          ] as const).map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-space-sm text-body-2 text-on-surface">
              <input
                type="radio"
                name="review-choice"
                value={value}
                checked={choice === value}
                onChange={() => onChoiceChange(value)}
                className="h-4 w-4 accent-primary"
              />
              {label}
            </label>
          ))}
        </fieldset>
        {choice === "reject" && (
          <label htmlFor="review-reason" className="block space-y-space-xs font-caption-bold text-caption-bold text-on-surface-variant">
            Lý do từ chối <span className="text-error">*</span>
            <textarea
              id="review-reason"
              value={rejectReason}
              maxLength={1000}
              required
              onChange={(event) => onReasonChange(event.target.value)}
              rows={4}
              className="block w-full resize-y rounded-lg border border-outline-variant bg-surface px-space-md py-space-sm font-body-2 text-body-2 text-on-surface outline-none focus:border-primary"
            />
            <span className="block text-right font-caption text-caption">{rejectReason.length}/1000</span>
          </label>
        )}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-primary px-space-md py-space-sm font-button-text text-button-text text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Đang xử lý…" : "Xác nhận quyết định"}
        </button>
      </form>
    </section>
  );
}
