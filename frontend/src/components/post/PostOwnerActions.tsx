import { Link } from "react-router-dom";
import type { TrangThaiBaiDang } from "../../types";
import type { PostAction } from "../../hooks/usePostActions";
import MaterialIcon from "../common/MaterialIcon";

interface Props {
  id: number;
  status: TrangThaiBaiDang;
  expired: boolean;
  busy: boolean;
  onAction: (action: PostAction) => void;
}

const actionClass = "inline-flex min-h-10 items-center justify-center gap-space-xs rounded-lg px-space-md font-button-text text-button-text transition-colors disabled:cursor-wait disabled:opacity-60";

export default function PostOwnerActions({ id, status, expired, busy, onAction }: Props) {
  return (
    <section className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-[0_2px_12px_rgba(0,0,0,0.05)]" aria-label="Quản lý tin đăng">
      <h2 className="m-0 font-headline-3 text-headline-3 text-on-surface">Quản lý tin</h2>
      <Link to={`/bai-dang/${id}/sua`} className={`${actionClass} bg-primary text-on-primary no-underline hover:bg-primary/90`}>
        <MaterialIcon name="edit" size={18} /> Chỉnh sửa
      </Link>
      {status === "DaDuyet" && (
        <>
          <button type="button" disabled={busy} onClick={() => onAction("an")} className={`${actionClass} bg-surface-container-high text-on-surface`}>
            <MaterialIcon name="visibility_off" size={18} /> Tạm ẩn
          </button>
          <button type="button" disabled={busy} onClick={() => onAction("daBan")} className={`${actionClass} bg-surface-container-high text-on-surface`}>
            <MaterialIcon name="sell" size={18} /> Đánh dấu đã bán
          </button>
          {!expired && (
            <button type="button" disabled={busy} onClick={() => onAction("dayTin")} className={`${actionClass} bg-primary-container text-on-primary-container`}>
              <MaterialIcon name="bolt" size={18} /> Đẩy tin
            </button>
          )}
          <button type="button" disabled={busy} onClick={() => onAction("giaHan")} className={`${actionClass} bg-surface-container-high text-on-surface`}>
            <MaterialIcon name="event_available" size={18} /> Gia hạn
          </button>
        </>
      )}
      {status === "DaAn" && (
        <>
          <button type="button" disabled={busy} onClick={() => onAction("hien")} className={`${actionClass} bg-surface-container-high text-on-surface`}>
            <MaterialIcon name="visibility" size={18} /> Hiện tin
          </button>
          <button type="button" disabled={busy} onClick={() => onAction("daBan")} className={`${actionClass} bg-surface-container-high text-on-surface`}>
            <MaterialIcon name="sell" size={18} /> Đánh dấu đã bán
          </button>
          <button type="button" disabled={busy} onClick={() => onAction("giaHan")} className={`${actionClass} bg-surface-container-high text-on-surface`}>
            <MaterialIcon name="event_available" size={18} /> Gia hạn
          </button>
        </>
      )}
    </section>
  );
}
