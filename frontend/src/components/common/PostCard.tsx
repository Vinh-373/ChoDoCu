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
  trangThai?: string;
}

/** Thẻ tin đăng. Giá nằm trên "tem giá" có lỗ xỏ dây – chi tiết nhận diện của chợ. */
export default function PostCard({ id, tieuDe, giaTien, anh, noiTrongTin, ngay, trangThai }: Props) {
  const fav = useFavorites();
  const saved = fav.has(id);

  return (
    <article className="post-card">
      <Link to={`/bai-dang/${id}`} className="post-card-media" aria-label={tieuDe}>
        <img src={imgSrc(anh)} alt="" loading="lazy" onError={onImgError} />
        {trangThai && trangThai !== "DaDuyet" && (
          <span className="badge badge-status">{TRANG_THAI_BAI_DANG[trangThai] ?? trangThai}</span>
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
