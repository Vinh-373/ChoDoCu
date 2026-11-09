import { useEffect, useRef, useState } from "react";
import { MAX_ANH, MAX_MO_TA, MAX_VIDEO } from "../../constants/baiDang";
import { imgSrc, onImgError } from "../../utils/image";
import MaterialIcon from "../common/MaterialIcon";
import type { PostDetailsValues, PostMediaItem } from "../../pages/post/usePostForm";

interface Props {
  categoryLabel: string;
  details: PostDetailsValues;
  media: PostMediaItem[];
  coverId: number | null;
  uploadBusy: boolean;
  error: string;
  fieldError: string;
  onChange: (patch: Partial<PostDetailsValues>) => void;
  onFilesSelected: (files: FileList) => void;
  onRemove: (id: number) => void;
  onMove?: (id: number, direction: -1 | 1) => void;
  onRetry: (item: PostMediaItem) => void;
  onSetCover: (id: number) => void;
  onChangeCategory: () => void;
  onContinue: () => void;
  onBack: () => void;
  hideFooter?: boolean;
}

function MediaPreview({ item }: { item: PostMediaItem }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!item.file) {
      setUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(item.file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [item.file]);
  return item.laVideo ? (
    <video src={url || imgSrc(item.duongDan)} className="h-full w-full object-cover" muted />
  ) : (
    <img src={url || imgSrc(item.duongDan)} alt={item.file?.name ?? item.name ?? ""} onError={onImgError} className="h-full w-full object-cover" />
  );
}

export default function PostMediaForm({
  categoryLabel, details, media, coverId, uploadBusy, error, fieldError, onChange, onFilesSelected, onRemove, onRetry,
  onMove, onSetCover, onChangeCategory, onContinue, onBack, hideFooter = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const photos = media.filter((item) => !item.laVideo);
  const videos = media.filter((item) => item.laVideo);
  const selectedCover = photos.find((item) => item.id === coverId) ?? photos[0];

  const selectFiles = (files: FileList | null) => {
    if (files?.length) onFilesSelected(files);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-space-lg">
      <header>
        <p className="m-0 font-caption-bold text-caption-bold uppercase tracking-wide text-primary">Bước 2 / 3</p>
        <h1 className="mb-space-2xs mt-space-xs font-headline-1 text-headline-1 text-on-surface">Hình ảnh & mô tả</h1>
      </header>

      <section className="flex items-center justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <div className="min-w-0">
          <p className="m-0 font-caption text-caption text-on-surface-variant">Danh mục đăng tin</p>
          <p className="mb-0 mt-space-2xs truncate font-button-text text-button-text text-on-surface">
            {categoryLabel}
          </p>
        </div>
        <button type="button" onClick={onChangeCategory} className="shrink-0 rounded-lg px-space-md py-space-xs font-button-text text-button-text text-primary hover:bg-primary-fixed">
          Thay đổi danh mục
        </button>
      </section>

      <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <div>
          <h2 className="m-0 font-headline-3 text-headline-3 text-on-surface">Ảnh và video sản phẩm <span className="text-error">*</span></h2>
          <p className="mb-0 mt-space-2xs font-caption text-caption text-on-surface-variant">
            JPG, PNG, WebP tối đa 5 MB/ảnh; MP4 tối đa 50 MB/video. Tối đa {MAX_ANH} ảnh và {MAX_VIDEO} video.
          </p>
        </div>
        <button
          type="button"
          disabled={uploadBusy}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); selectFiles(event.dataTransfer.files); }}
          className={`flex min-h-36 flex-col items-center justify-center gap-space-xs rounded-xl border-2 border-dashed p-space-lg text-center disabled:cursor-wait disabled:opacity-70 ${
            dragging ? "border-primary bg-primary-fixed/40" : "border-outline-variant bg-surface-container-low hover:border-primary"
          }`}
        >
          <MaterialIcon name="cloud_upload" size={32} className="text-primary" />
          <span className="font-button-text text-button-text text-on-surface">Kéo thả tệp vào đây hoặc chọn từ thiết bị</span>
          <span className="font-caption text-caption text-on-surface-variant">{photos.length}/{MAX_ANH} ảnh · {videos.length}/{MAX_VIDEO} video</span>
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4" multiple hidden disabled={uploadBusy} onChange={(event) => selectFiles(event.target.files)} />

        {media.length > 0 && (
          <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-3 md:grid-cols-4">
            {media.map((item, index) => {
              const isCover = !item.laVideo && item.id === selectedCover?.id;
              return (
                <article key={item.id} className={`overflow-hidden rounded-xl border ${isCover ? "border-primary ring-1 ring-primary" : "border-outline-variant"}`}>
                  <div className="relative aspect-square bg-surface-container">
                    <MediaPreview item={item} />
                    {isCover && <span className="absolute left-space-xs top-space-xs rounded-full bg-primary px-space-sm py-space-2xs font-caption-bold text-caption-bold text-on-primary">Ảnh bìa</span>}
                    <button type="button" aria-label="Xóa tệp" disabled={uploadBusy} onClick={() => onRemove(item.id)} className="absolute right-space-xs top-space-xs flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest text-error shadow disabled:opacity-50">
                      <MaterialIcon name="delete" size={18} />
                    </button>
                    {item.progress > 0 && item.progress < 100 && <progress className="absolute bottom-0 left-0 h-1 w-full accent-primary" value={item.progress} max={100} />}
                  </div>
                  <div className="flex flex-col gap-space-2xs p-space-sm">
                    <span className="truncate font-caption text-caption text-on-surface" title={item.file?.name ?? item.name ?? item.duongDan}>{item.file?.name ?? item.name ?? item.duongDan}</span>
                    {item.error ? (
                      <div className="flex flex-col gap-space-2xs">
                        <span className="font-caption text-caption text-error">{item.error}</span>
                        <button type="button" disabled={uploadBusy} onClick={() => onRetry(item)} className="self-start font-caption-bold text-caption-bold text-primary disabled:opacity-50">Tải lại</button>
                      </div>
                    ) : !item.duongDan ? (
                      <span className="font-caption text-caption text-on-surface-variant">Đang tải {item.progress}%</span>
                    ) : !item.laVideo ? (
                      <button type="button" onClick={() => onSetCover(item.id)} className="self-start font-caption-bold text-caption-bold text-primary">
                        {isCover ? "Ảnh bìa mặc định" : "Chọn làm ảnh bìa"}
                      </button>
                    ) : <span className="font-caption text-caption text-secondary">Đã tải lên</span>}
                    {onMove && (
                      <div className="flex gap-space-xs">
                        <button
                          type="button"
                          aria-label="Di chuyển lên"
                          disabled={uploadBusy || index === 0}
                          onClick={() => onMove(item.id, -1)}
                          className="rounded-md border border-outline-variant px-space-sm py-space-2xs font-caption text-caption text-on-surface disabled:opacity-40"
                        >↑ Lên</button>
                        <button
                          type="button"
                          aria-label="Di chuyển xuống"
                          disabled={uploadBusy || index === media.length - 1}
                          onClick={() => onMove(item.id, 1)}
                          className="rounded-md border border-outline-variant px-space-sm py-space-2xs font-caption text-caption text-on-surface disabled:opacity-40"
                        >↓ Xuống</button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {fieldError && <p className="m-0 font-caption text-caption text-error" role="alert">{fieldError}</p>}
      <section className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <label htmlFor="post-description" className="font-headline-3 text-headline-3 text-on-surface">Mô tả chi tiết <span className="text-error">*</span></label>
        <textarea
          id="post-description"
          required
          maxLength={MAX_MO_TA}
          value={details.moTa}
          onChange={(event) => onChange({ moTa: event.target.value })}
          placeholder="Mô tả tình trạng, thời gian sử dụng, phụ kiện đi kèm…"
          className="min-h-40 w-full resize-y rounded-xl border-0 bg-surface-container-low px-space-md py-space-sm font-body-2 text-body-2 text-on-surface placeholder:text-on-surface-variant/70 focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#ff7a00]"
        />
        <span className={`self-end font-caption text-caption ${details.moTa.length >= MAX_MO_TA ? "text-error" : "text-on-surface-variant"}`}>
          {details.moTa.length}/{MAX_MO_TA}
        </span>
      </section>

      {error && <p className="m-0 font-caption text-caption text-error" role="alert">{error}</p>}
      {!hideFooter && (
        <div className="flex justify-between gap-space-sm">
          <button type="button" onClick={onBack} className="h-11 rounded-xl border border-outline-variant px-space-lg font-button-text text-button-text text-on-surface hover:bg-surface-container-low">Quay về</button>
          <button type="button" onClick={onContinue} disabled={uploadBusy} className="inline-flex h-11 items-center gap-space-xs rounded-xl bg-primary-container px-space-xl font-button-text text-button-text text-on-primary disabled:cursor-wait disabled:opacity-50">
            Tiếp tục <MaterialIcon name="arrow_forward" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
