import { Link, useLocation } from "react-router-dom";
import MaterialIcon from "../common/MaterialIcon";
import type { BaiDangQuanTriResponse } from "../../types";
import { formatPrice, timeAgo, TRANG_THAI_BAI_DANG, TRANG_THAI_BAI_DANG_BADGE } from "../../utils/format";
import { imgSrc, onImgError } from "../../utils/image";

interface Props {
  post: BaiDangQuanTriResponse;
  selected: boolean;
  busy: boolean;
  onToggle: (id: number, checked: boolean) => void;
  onApprove: (post: BaiDangQuanTriResponse) => void;
  onReject: (post: BaiDangQuanTriResponse) => void;
}

export default function AdminPostRow({ post, selected, busy, onToggle, onApprove, onReject }: Props) {
  const location = useLocation();
  const pending = post.trangThai === "ChoDuyet";
  const badge = TRANG_THAI_BAI_DANG_BADGE[post.trangThai];

  return (
    <tr className="border-t border-surface-variant align-top hover:bg-surface-container-low/70">
      <td className="px-space-md py-space-lg">
        <input
          type="checkbox"
          aria-label={`Chọn tin ${post.maTin}`}
          checked={selected}
          disabled={!pending || busy}
          onChange={(event) => onToggle(post.id, event.target.checked)}
          className="h-4 w-4 accent-primary"
        />
      </td>
      <td className="min-w-[190px] px-space-md py-space-lg">
        <div className="flex items-center gap-space-sm">
          <img
            src={imgSrc(post.anhBia)}
            alt=""
            onError={onImgError}
            loading="lazy"
            className="h-14 w-16 shrink-0 rounded-lg object-cover"
          />
          <span className="text-caption text-on-surface-variant">{post.maTin}</span>
        </div>
      </td>
      <td className="min-w-[190px] px-space-md py-space-lg">
        <p className="m-0 font-caption-bold text-caption-bold text-on-surface">{post.tieuDe}</p>
        <p className="mb-0 mt-space-xs text-caption text-on-surface-variant">{post.tenDanhMuc}</p>
      </td>
      <td className="min-w-[150px] px-space-md py-space-lg">
        <p className="m-0 font-caption-bold text-caption-bold text-on-surface">{post.nguoiDang.ten}</p>
        <p className="mb-0 mt-space-xs text-caption text-on-surface-variant">{post.nguoiDang.soDienThoai || "Chưa có SĐT"}</p>
      </td>
      <td className="min-w-[145px] px-space-md py-space-lg">
        <p className="m-0 font-price-md text-price-md text-primary">{formatPrice(post.giaTien)}</p>
        {post.coThuongLuong && (
          <span className="mt-space-xs inline-block rounded-full bg-tertiary-fixed px-space-xs py-space-2xs text-caption text-on-tertiary-fixed">
            Có thương lượng
          </span>
        )}
      </td>
      <td className="min-w-[130px] px-space-md py-space-lg">
        <time dateTime={post.ngayDang} title={new Date(post.ngayDang).toLocaleString("vi-VN")} className="text-caption text-on-surface-variant">
          {timeAgo(post.ngayDang)}
        </time>
      </td>
      <td className="min-w-[125px] px-space-md py-space-lg">
        <span className={`inline-flex items-center gap-space-xs rounded-full px-space-sm py-space-xs font-caption-bold text-caption-bold ${badge.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
          {TRANG_THAI_BAI_DANG[post.trangThai]}
        </span>
        {post.trangThai === "BiTuChoi" && post.lyDoTuChoi && (
          <p className="mb-0 mt-space-xs max-w-48 text-caption text-error" title={post.lyDoTuChoi}>
            Lý do: {post.lyDoTuChoi}
          </p>
        )}
      </td>
      <td className="min-w-[220px] px-space-md py-space-lg">
        <div className="flex flex-wrap items-center gap-space-xs">
          {pending && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onApprove(post)}
                className="inline-flex items-center gap-space-2xs rounded-lg bg-secondary px-space-sm py-space-xs font-caption-bold text-caption-bold text-on-secondary hover:opacity-90 disabled:opacity-50"
              >
                <MaterialIcon name="check" size={16} />
                Duyệt
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onReject(post)}
                className="inline-flex items-center gap-space-2xs rounded-lg border border-error/40 bg-surface-container-lowest px-space-sm py-space-xs font-caption-bold text-caption-bold text-error hover:bg-error-container disabled:opacity-50"
              >
                <MaterialIcon name="close" size={16} />
                Từ chối
              </button>
            </>
          )}
          <Link
            to={`/quan-tri/bai-dang/${post.id}`}
            state={{ from: `${location.pathname}${location.search}` }}
            className="inline-flex items-center gap-space-2xs rounded-lg px-space-sm py-space-xs font-caption-bold text-caption-bold text-primary hover:bg-primary-fixed"
          >
            <MaterialIcon name="open_in_new" size={16} />
            Xem chi tiết
          </Link>
        </div>
      </td>
    </tr>
  );
}
