import { Link } from "react-router-dom";
import type { BaiDang, TrangThaiBaiDang } from "../../types";
import { formatPrice, timeAgo } from "../../utils/format";
import { imgSrc, onImgError } from "../../utils/image";
import MaterialIcon from "../common/MaterialIcon";

export const STATUS_VIEW: Record<TrangThaiBaiDang, { label: string; badge: string; dot: string }> = {
  DaDuyet: { label: "Đang hiển thị", badge: "bg-secondary-container/50 text-on-secondary-container", dot: "bg-secondary" },
  ChoDuyet: { label: "Chờ duyệt", badge: "bg-tertiary-fixed text-on-tertiary-fixed-variant", dot: "bg-tertiary-container" },
  TuChoi: { label: "Cần chỉnh sửa", badge: "bg-error-container text-on-error-container", dot: "bg-error" },
  DaAn: { label: "Đã ẩn", badge: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" },
};

const action =
  "inline-flex items-center gap-space-xs h-8 px-space-md rounded-lg border-0 cursor-pointer no-underline hover:no-underline font-caption-bold text-caption-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
const actionQuiet = `${action} bg-surface-container-high hover:bg-surface-variant text-on-surface`;

interface Props {
  post: BaiDang;
  selected: boolean;
  busy: boolean;
  onSelect: (checked: boolean) => void;
  onToggleHidden: () => void;
}

/** Một dòng trong danh sách "Tin đăng của tôi": ảnh, thông tin chính và các thao tác theo trạng thái. */
export default function MyPostItem({ post, selected, busy, onSelect, onToggleHidden }: Props) {
  const view = STATUS_VIEW[post.trangThai];
  const accent = post.trangThai === "ChoDuyet" ? "border-l-4 border-tertiary-container" : post.trangThai === "TuChoi" ? "border-l-4 border-error" : "";

  return (
    <article className={`bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-space-md flex gap-space-md ${accent}`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onSelect(e.target.checked)}
        aria-label={`Chọn tin ${post.tieuDe}`}
        className="mt-space-xs w-4 h-4 accent-primary-container cursor-pointer shrink-0"
      />
      <Link to={`/bai-dang/${post.id}`} className="shrink-0 self-start" aria-label={post.tieuDe}>
        <img src={imgSrc(post.anhs[0])} alt="" onError={onImgError} loading="lazy" className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover bg-surface-container" />
      </Link>

      <div className="min-w-0 flex-1 flex flex-col gap-space-xs">
        <div className="flex items-start justify-between gap-space-sm">
          <p className="m-0 font-caption text-caption text-on-surface-variant truncate">
            Mã: #TIN-{post.id} <span aria-hidden="true">/</span> {post.tenDanhMuc}
          </p>
          <span className={`shrink-0 inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full font-caption-bold text-caption-bold ${view.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${view.dot}`} /> {view.label}
          </span>
        </div>

        <h3 className="m-0 font-body-1 text-body-1 font-semibold text-on-surface line-clamp-2">
          <Link to={`/bai-dang/${post.id}`} className="text-inherit no-underline hover:underline">
            {post.tieuDe}
          </Link>
        </h3>
        <p className="m-0 font-price-lg text-price-lg text-error">{formatPrice(post.giaTien)}</p>

        <p className="m-0 flex flex-wrap items-center gap-x-space-md gap-y-space-2xs font-caption text-caption text-on-surface-variant">
          <span className="inline-flex items-center gap-space-2xs">
            <MaterialIcon name="location_on" size={14} /> {post.tenThanhPho || post.diaChi}
          </span>
          <span className="inline-flex items-center gap-space-2xs">
            <MaterialIcon name="schedule" size={14} /> {timeAgo(post.ngayDang)}
          </span>
        </p>

        {post.trangThai === "ChoDuyet" && (
          <p className="m-0 flex items-start gap-space-xs rounded-lg bg-surface-container-low px-space-sm py-space-xs font-caption text-caption text-on-surface-variant">
            <MaterialIcon name="info" size={14} className="mt-px" /> Tin đang được kiểm duyệt nội dung và hình ảnh trước khi hiển thị cho người mua.
          </p>
        )}
        {post.trangThai === "TuChoi" && (
          <p className="m-0 flex items-start gap-space-xs rounded-lg bg-error-container/50 px-space-sm py-space-xs font-caption text-caption text-on-error-container">
            <MaterialIcon name="report" size={14} className="mt-px" /> Tin chưa được duyệt. Hãy đăng lại tin với nội dung phù hợp quy định.
          </p>
        )}

        <div className="mt-space-xs flex flex-wrap items-center gap-space-sm">
          {post.trangThai === "DaDuyet" && (
            <Link to="/dich-vu" className={`${action} bg-primary-container hover:bg-primary text-on-primary`}>
              <MaterialIcon name="bolt" size={16} filled /> Đẩy tin
            </Link>
          )}
          {post.trangThai === "TuChoi" && (
            <Link to="/dang-bai" className={`${action} bg-primary-container hover:bg-primary text-on-primary`}>
              <MaterialIcon name="add_circle" size={16} /> Đăng lại
            </Link>
          )}
          <Link to={`/bai-dang/${post.id}`} className={actionQuiet}>
            <MaterialIcon name="open_in_new" size={16} /> Xem tin
          </Link>
          {(post.trangThai === "DaDuyet" || post.trangThai === "DaAn") && (
            <button type="button" disabled={busy} onClick={onToggleHidden} className={`${actionQuiet} sm:ml-auto`}>
              <MaterialIcon name={post.trangThai === "DaAn" ? "visibility" : "visibility_off"} size={16} />
              {post.trangThai === "DaAn" ? "Hiện lại" : "Ẩn tin"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
