import { Link } from "react-router-dom";
import type { BaiDangCuaToiResponse, TrangThaiBaiDang } from "../../types";
import { formatDate, formatPrice, timeAgo } from "../../utils/format";
import { imgSrc, onImgError } from "../../utils/image";
import type { PostAction } from "../../hooks/usePostActions";
import MaterialIcon from "../common/MaterialIcon";

const STATUS_VIEW: Record<TrangThaiBaiDang, { label: string; badge: string; dot: string }> = {
  DaDuyet: { label: "Đang hiển thị", badge: "bg-secondary-container/50 text-on-secondary-container", dot: "bg-secondary" },
  ChoDuyet: { label: "Chờ duyệt", badge: "bg-tertiary-fixed text-on-tertiary-fixed-variant", dot: "bg-tertiary-container" },
  BiTuChoi: { label: "Bị từ chối", badge: "bg-error-container text-on-error-container", dot: "bg-error" },
  DaAn: { label: "Đã ẩn", badge: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" },
  DaBan: { label: "Đã bán", badge: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" },
};

const actionClass = "inline-flex items-center gap-space-xs h-8 px-space-md rounded-lg border-0 cursor-pointer no-underline hover:no-underline font-caption-bold text-caption-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
const quietAction = `${actionClass} bg-surface-container-high hover:bg-surface-variant text-on-surface`;

interface Props {
  post: BaiDangCuaToiResponse;
  categoryLabel: string;
  busy: boolean;
  onAction: (action: PostAction) => void;
}

export default function MyPostItem({ post, categoryLabel, busy, onAction }: Props) {
  const status = STATUS_VIEW[post.trangThai];
  const rejected = post.trangThai === "BiTuChoi";
  const accent = post.trangThai === "ChoDuyet" ? "border-l-4 border-tertiary-container" : rejected ? "border-l-4 border-error" : "";
  const edit = <Link to={`/bai-dang/${post.id}/sua`} className={quietAction}><MaterialIcon name="edit" size={16} /> Sửa tin</Link>;

  return (
    <article className={`bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-space-md flex gap-space-md ${accent}`}>
      <Link to={`/bai-dang/${post.id}`} className="shrink-0 self-start" aria-label={post.tieuDe}>
        <img src={imgSrc(post.anhBia)} alt="" onError={onImgError} loading="lazy" className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover bg-surface-container" />
      </Link>
      <div className="min-w-0 flex-1 flex flex-col gap-space-xs">
        <div className="flex items-start justify-between gap-space-sm">
          <p className="m-0 font-caption text-caption text-on-surface-variant truncate">
            Mã: {post.maTin || `#TIN-${post.id}`} <span aria-hidden="true">/</span> {categoryLabel}
          </p>
          <span className={`shrink-0 inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full font-caption-bold text-caption-bold ${status.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} /> {status.label}
          </span>
        </div>
        <h3 className="m-0 font-body-1 text-body-1 font-semibold text-on-surface line-clamp-2">
          <Link to={`/bai-dang/${post.id}`} className="text-inherit no-underline hover:underline">{post.tieuDe}</Link>
        </h3>
        <p className="m-0 font-price-lg text-price-lg text-error">{formatPrice(post.giaTien)}</p>
        <p className="m-0 flex flex-wrap items-center gap-x-space-md gap-y-space-2xs font-caption text-caption text-on-surface-variant">
          <span className="inline-flex items-center gap-space-2xs"><MaterialIcon name="location_on" size={14} /> {post.khuVuc || "Chưa cập nhật khu vực"}</span>
          <span className="inline-flex items-center gap-space-2xs" title={timeAgo(post.ngayDang)}><MaterialIcon name="schedule" size={14} /> {formatDate(post.ngayDang)}</span>
          <span className="inline-flex items-center gap-space-2xs"><MaterialIcon name="visibility" size={14} /> {post.luotXem} lượt xem</span>
          <span className="inline-flex items-center gap-space-2xs"><MaterialIcon name="favorite" size={14} /> {post.luotLuu} lượt lưu</span>
        </p>
        {post.trangThai === "ChoDuyet" && (
          <p className="m-0 flex items-start gap-space-xs rounded-lg bg-surface-container-low px-space-sm py-space-xs font-caption text-caption text-on-surface-variant">
            <MaterialIcon name="info" size={14} className="mt-px" /> Tin đang chờ kiểm duyệt trước khi hiển thị cho người mua.
          </p>
        )}
        {rejected && (
          <p className="m-0 flex items-start gap-space-xs rounded-lg bg-error-container/50 px-space-sm py-space-xs font-caption text-caption text-on-error-container">
            <MaterialIcon name="report" size={14} className="mt-px" /> {post.lyDoTuChoi || "Tin chưa được duyệt."}
          </p>
        )}
        {post.daHetHan && (
          <p className="m-0 font-caption-bold text-caption-bold text-error">
            Hết hạn{post.ngayHetHan ? ` ngày ${formatDate(post.ngayHetHan)}` : ""}
          </p>
        )}
        <div className="mt-space-xs flex flex-wrap items-center gap-space-sm">
          {edit}
          {post.trangThai === "DaDuyet" && (
            <>
              <button type="button" disabled={busy} onClick={() => onAction("dayTin")} className={`${actionClass} bg-primary-container hover:bg-primary text-on-primary`}>
                <MaterialIcon name="bolt" size={16} filled /> Đẩy tin VIP
              </button>
              <button type="button" disabled={busy} onClick={() => onAction("an")} className={quietAction}>
                <MaterialIcon name="visibility_off" size={16} /> Ẩn tin
              </button>
              <button type="button" disabled={busy} onClick={() => onAction("daBan")} className={quietAction}>
                <MaterialIcon name="sell" size={16} /> Đánh dấu đã bán
              </button>
              {post.daHetHan && (
                <button type="button" disabled={busy} onClick={() => onAction("giaHan")} className={quietAction}>
                  <MaterialIcon name="event_available" size={16} /> Gia hạn
                </button>
              )}
            </>
          )}
          {post.trangThai === "DaAn" && (
            <>
              <button type="button" disabled={busy} onClick={() => onAction("hien")} className={quietAction}>
                <MaterialIcon name="visibility" size={16} /> Hiện tin
              </button>
              <button type="button" disabled={busy} onClick={() => onAction("daBan")} className={quietAction}>
                <MaterialIcon name="sell" size={16} /> Đánh dấu đã bán
              </button>
            </>
          )}
          {post.trangThai === "ChoDuyet" && (
            <button type="button" disabled={busy} onClick={() => onAction("huyDang")} className={quietAction}>
              <MaterialIcon name="cancel" size={16} /> Hủy đăng
            </button>
          )}
          {(post.trangThai === "DaDuyet" || post.trangThai === "DaAn" || rejected || post.trangThai === "DaBan") && (
            <button type="button" disabled={busy} onClick={() => onAction("xoa")} aria-label="Xóa tin" title="Xóa tin" className={`${quietAction} w-8 justify-center px-0`}>
              <MaterialIcon name="delete" size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
