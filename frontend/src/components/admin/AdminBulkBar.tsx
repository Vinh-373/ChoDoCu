import MaterialIcon from "../common/MaterialIcon";

interface Props {
  selectedCount: number;
  disabled: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export default function AdminBulkBar({ selectedCount, disabled, onApprove, onReject }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-space-md rounded-xl border border-primary-fixed bg-primary-fixed/40 px-space-lg py-space-md">
      <p className="m-0 font-caption-bold text-caption-bold text-on-primary-fixed-variant">
        Đã chọn {selectedCount} tin
      </p>
      <div className="flex flex-wrap gap-space-sm">
        <button
          type="button"
          disabled={disabled}
          onClick={onApprove}
          className="inline-flex items-center gap-space-xs rounded-lg bg-secondary px-space-md py-space-sm font-button-text text-button-text text-on-secondary hover:opacity-90 disabled:opacity-50"
        >
          <MaterialIcon name="done_all" size={18} />
          Duyệt nhanh đã chọn
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onReject}
          className="inline-flex items-center gap-space-xs rounded-lg border border-error/40 bg-surface-container-lowest px-space-md py-space-sm font-button-text text-button-text text-error hover:bg-error-container disabled:opacity-50"
        >
          <MaterialIcon name="block" size={18} />
          Từ chối đã chọn
        </button>
      </div>
    </div>
  );
}
