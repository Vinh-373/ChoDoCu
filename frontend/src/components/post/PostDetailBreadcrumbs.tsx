import { Link } from "react-router-dom";
import MaterialIcon from "../common/MaterialIcon";

interface Props {
  isOwner: boolean;
  maTin: string;
}

export default function PostDetailBreadcrumbs({ isOwner, maTin }: Props) {
  return (
    <nav aria-label="Đường dẫn" className="mb-space-lg flex flex-wrap items-center gap-space-xs font-caption text-caption text-on-surface-variant">
      <Link to="/" className="inline-flex items-center gap-space-2xs text-on-surface-variant no-underline hover:text-primary">
        <MaterialIcon name="home" size={16} className="text-primary" />
        Chợ Đồ Cũ
      </Link>
      {isOwner && (
        <>
          <span aria-hidden="true">/</span>
          <Link to="/tai-khoan/quan-ly-tin" className="text-on-surface-variant no-underline hover:text-primary">
            Quản lý tin đăng
          </Link>
        </>
      )}
      <span aria-hidden="true">/</span>
      <span className="font-caption-bold text-caption-bold text-on-surface" aria-current="page">
        Chi tiết tin #{maTin}
      </span>
    </nav>
  );
}
