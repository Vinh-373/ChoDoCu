import { useState } from "react";
import type { BaiDangMediaResponse } from "../../types";
import { imgSrc, onImgError } from "../../utils/image";
import MaterialIcon from "../common/MaterialIcon";

interface Props {
  media: BaiDangMediaResponse[];
  title: string;
}

export default function PostGallery({ media, title }: Props) {
  const [active, setActive] = useState(0);
  const selected = media[active];

  const change = (offset: number) => {
    setActive((current) => (current + offset + media.length) % media.length);
  };

  return (
    <section className="overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-[0_2px_12px_rgba(0,0,0,0.05)]" aria-label="Thư viện ảnh sản phẩm">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-surface-container">
        {selected?.laVideo ? (
          <video key={selected.duongDan} src={imgSrc(selected.duongDan)} controls playsInline className="h-full w-full object-contain" />
        ) : (
          <img src={imgSrc(selected?.duongDan)} alt={title} onError={onImgError} className="h-full w-full object-contain" />
        )}
        <span className="absolute bottom-space-sm right-space-sm rounded-full bg-black/70 px-space-sm py-space-2xs font-caption-bold text-caption-bold text-white" aria-live="polite">
          {active + 1}/{media.length}
        </span>
        {media.length > 1 && (
          <>
            <button type="button" aria-label="Tệp trước" onClick={() => change(-1)} className="absolute left-space-sm flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest/90 text-on-surface shadow">
              <MaterialIcon name="chevron_left" size={24} />
            </button>
            <button type="button" aria-label="Tệp tiếp theo" onClick={() => change(1)} className="absolute right-space-sm flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest/90 text-on-surface shadow">
              <MaterialIcon name="chevron_right" size={24} />
            </button>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="mt-space-sm flex gap-space-xs overflow-x-auto pb-space-2xs" role="tablist" aria-label="Chọn ảnh hoặc video">
          {media.map((item, index) => (
            <button
              key={`${item.duongDan}-${index}`}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`${item.laVideo ? "Video" : "Ảnh"} ${index + 1}`}
              onClick={() => setActive(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-surface-container ${active === index ? "border-primary" : "border-transparent"}`}
            >
              {item.laVideo ? (
                <span className="flex h-full w-full items-center justify-center text-on-surface-variant">
                  <MaterialIcon name="play_circle" size={30} />
                </span>
              ) : (
                <img src={imgSrc(item.duongDan)} alt="" onError={onImgError} className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
