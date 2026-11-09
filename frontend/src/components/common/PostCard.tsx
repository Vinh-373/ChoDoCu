import { Link } from "react-router-dom";
import { useFavorites } from "../../contexts/FavoritesContext";
import { formatPrice, timeAgo, TRANG_THAI_BAI_DANG } from "../../utils/format";
import { imgSrc, onImgError } from "../../utils/image";
import Icon from "./Icon";

interface Props {
  id: number;
  tieuDe: string;
  giaTien: number;
  anh?: string | null;
  noiTrongTin?: string; // ví dụ tên thành phố
  ngay?: string;
  laTinUuTien?: boolean;
  ngayDayTin?: string | null;
  trangThai?: string;
}

/** Thẻ tin đăng. Giá nằm trên "tem giá" có lỗ xỏ dây – chi tiết nhận diện của chợ. */
export default function PostCard({ id, tieuDe, giaTien, anh, noiTrongTin, ngay, laTinUuTien, ngayDayTin, trangThai }: Props) {
  const fav = useFavorites();
  const saved = fav.has(id);
  const pushedAt = ngayDayTin ? new Date(ngayDayTin).getTime() : Number.NaN;
  const pushedRecently = Number.isFinite(pushedAt) && Date.now() >= pushedAt && Date.now() - pushedAt <= 3 * 24 * 60 * 60 * 1000;

  return (
    <article className="post-card">
      <Link to={`/bai-dang/${id}`} className="post-card-media" aria-label={tieuDe}>
        <img src={imgSrc(anh)} alt="" loading="lazy" onError={onImgError} />
        {(laTinUuTien || pushedRecently || (trangThai && trangThai !== "DaDuyet")) && (
          <span className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
            {laTinUuTien && <span className="rounded-full bg-primary px-space-sm py-space-2xs text-caption-bold text-on-primary">Ưu tiên</span>}
            {pushedRecently && <span className="rounded-full bg-secondary-container px-space-sm py-space-2xs text-caption-bold text-on-secondary-container">Đã đẩy</span>}
            {trangThai && trangThai !== "DaDuyet" && <span className="badge badge-status !static">{TRANG_THAI_BAI_DANG[trangThai] ?? trangThai}</span>}
          </span>
        )}
      </Link>
      <button
        type="button"
        className={`heart ${saved ? "is-on" : ""}`}
        aria-pressed={saved}
        aria-label={saved ? "Bỏ khỏi yêu thích" : "Lưu vào yêu thích"}
        onClick={() => void fav.toggle(id)}
      >
        <Icon name="heart" size={18} filled={saved} />
      </button>
      <div className="post-card-body">
        <span className="price-tag">{formatPrice(giaTien)}</span>
        <h3 className="post-card-title">
          <Link to={`/bai-dang/${id}`}>{tieuDe}</Link>
        </h3>
        <p className="post-card-meta">
          {noiTrongTin && (
            <span>
              <Icon name="pin" size={14} /> {noiTrongTin}
            </span>
          )}
          {ngay && <span>{timeAgo(ngay)}</span>}
        </p>
      </div>
    </article>
  );
}
