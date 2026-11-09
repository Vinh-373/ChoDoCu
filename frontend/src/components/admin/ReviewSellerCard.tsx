import MaterialIcon from "../common/MaterialIcon";
import { imgSrc, onImgError } from "../../utils/image";

interface Props {
  image?: string | null;
  name: string;
  phone?: string | null;
  region?: string | null;
}

export default function ReviewSellerCard({ image, name, phone, region }: Props) {
  return (
    <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
      <h2 className="mb-space-md mt-0 font-headline-3 text-headline-3 text-on-surface">Hồ sơ người bán</h2>
      <div className="flex items-center gap-space-md">
        <img src={imgSrc(image)} alt="" onError={onImgError} className="h-14 w-14 rounded-full object-cover" />
        <strong className="font-button-text text-button-text text-on-surface">{name || "Người bán"}</strong>
      </div>
      <dl className="mb-0 mt-space-md space-y-space-sm">
        <div className="flex items-start gap-space-sm">
          <dt className="flex shrink-0 items-center gap-space-xs text-caption text-on-surface-variant"><MaterialIcon name="call" size={16} /> Liên hệ</dt>
          <dd className="m-0 break-all text-right font-caption-bold text-caption-bold text-on-surface">{phone || "Chưa cung cấp"}</dd>
        </div>
        <div className="flex items-start gap-space-sm">
          <dt className="flex shrink-0 items-center gap-space-xs text-caption text-on-surface-variant"><MaterialIcon name="location_on" size={16} /> Khu vực</dt>
          <dd className="m-0 text-right font-caption-bold text-caption-bold text-on-surface">{region || "Chưa cung cấp"}</dd>
        </div>
      </dl>
    </section>
  );
}
