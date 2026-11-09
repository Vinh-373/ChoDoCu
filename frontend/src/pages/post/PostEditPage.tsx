import { useState } from "react";
import { useParams } from "react-router-dom";
import PostCategoryStep from "../../components/post/PostCategoryStep";
import PostDetailsForm from "../../components/post/PostDetailsForm";
import PostMediaForm from "../../components/post/PostMediaForm";
import MaterialIcon from "../../components/common/MaterialIcon";
import { ErrorBox, Spinner } from "../../components/common/State";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import useQuota from "../../hooks/useQuota";
import { formatDate, formatPrice, TRANG_THAI_BAI_DANG, TRANG_THAI_BAI_DANG_BADGE } from "../../utils/format";
import { imgSrc, onImgError } from "../../utils/image";
import usePostEditForm from "./usePostEditForm";

export default function PostEditPage() {
  const { id } = useParams();
  const form = usePostEditForm(Number(id));
  const quota = useQuota();
  const [previewOpen, setPreviewOpen] = useState(false);
  useDocumentTitle("Chỉnh sửa tin đăng");

  if (form.loading) return <Spinner label="Đang tải tin đăng…" />;
  if (!form.post) {
    return (
      <main className="mx-auto w-full max-w-7xl px-margin py-space-xl">
        <ErrorBox message={form.loadError || "Không tìm thấy tin đăng."} />
      </main>
    );
  }

  const { post } = form;
  const status = TRANG_THAI_BAI_DANG_BADGE[post.trangThai] ?? TRANG_THAI_BAI_DANG_BADGE.DaAn;
  const cover = form.media.find((item) => item.id === form.coverId && !item.laVideo)
    ?? form.media.find((item) => !item.laVideo);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-space-lg px-margin py-space-xl">
      <header className="flex flex-col gap-space-sm">
        <h1 className="m-0 font-headline-1 text-headline-1 text-on-surface">Chỉnh sửa tin đăng</h1>
        <div className="flex flex-wrap items-center gap-space-sm font-caption text-caption text-on-surface-variant">
          <span>Mã tin: {post.maTin || post.id}</span>
          <span className={`rounded-full px-space-sm py-space-2xs font-caption-bold text-caption-bold ${status.badge}`}>
            {TRANG_THAI_BAI_DANG[post.trangThai] ?? post.trangThai}
          </span>
          <span>Ngày đăng: {formatDate(post.ngayDang) || "—"}</span>
          <span>{post.luotXem ?? 0} lượt xem</span>
          <span>{post.luotLuu ?? 0} lượt lưu</span>
        </div>
      </header>

      <aside className="rounded-xl border border-tertiary-container bg-tertiary-fixed px-space-lg py-space-md font-body-2 text-body-2 text-on-tertiary-fixed">
        Lưu ý: Thay đổi giá, tiêu đề, thông số hoặc hình ảnh sẽ khiến tin được kiểm duyệt lại.
      </aside>

      {post.trangThai === "BiTuChoi" && (
        <aside className="rounded-xl border border-error bg-error-container/50 px-space-lg py-space-md font-body-2 text-body-2 text-on-error-container">
          <p className="m-0"><strong>Lý do từ chối:</strong> {post.lyDoTuChoi || "Tin đăng chưa được duyệt."}</p>
          <p className="mb-0 mt-space-xs">Lưu thay đổi sẽ gửi duyệt lại và dùng 1 lượt đăng (còn {quota.loading ? "…" : quota.luotDang} lượt).</p>
          {quota.error && <p className="mb-0 mt-space-xs font-caption text-caption" role="alert">{quota.error}</p>}
        </aside>
      )}

      {post.trangThai === "DaBan" ? (
        <section className="rounded-xl bg-surface-container-low p-space-lg" role="status">
          <h2 className="mb-space-xs mt-0 font-headline-3 text-headline-3 text-on-surface">Tin đã bán</h2>
          <p className="m-0 font-body-2 text-body-2 text-on-surface-variant">Tin đã bán không thể chỉnh sửa.</p>
        </section>
      ) : !form.selectedCategory || !form.selectedParent ? (
        form.categories.loading ? <Spinner label="Đang tải danh mục…" /> : (
          <ErrorBox
            message={form.categories.error ?? "Không xác định được danh mục hiện tại của tin."}
            onRetry={form.categories.reload}
          />
        )
      ) : form.step === "category" ? (
        <PostCategoryStep
          categories={form.categories}
          parentId={form.parentId}
          childId={form.childId}
          error={form.categoryError}
          onChooseParent={form.chooseParent}
          onChooseChild={form.chooseChild}
          onContinue={form.continueCategory}
        />
      ) : form.step === "media" ? (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-space-lg">
          <PostMediaForm
            categoryLabel={form.categoryLabel}
            details={form.details}
            media={form.media}
            coverId={cover?.id ?? null}
            uploadBusy={form.uploadBusy}
            error={form.formError}
            fieldError={form.fieldErrors.moTa ?? ""}
            onChange={form.changeDetails}
            onFilesSelected={form.addFiles}
            onRemove={form.removeMedia}
            onRetry={form.uploadOne}
            onSetCover={form.setCover}
            onMove={form.moveMedia}
            onChangeCategory={() => { form.setStep("category"); }}
            onContinue={form.continueMedia}
            onBack={() => form.setStep("details")}
            hideFooter
          />
          <div className="flex justify-end">
            <button type="button" onClick={form.continueMedia} disabled={form.uploadBusy} className="inline-flex h-11 items-center gap-space-xs rounded-xl bg-primary-container px-space-xl font-button-text text-button-text text-on-primary disabled:opacity-50">
              Tiếp tục <MaterialIcon name="arrow_forward" size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-space-lg">
          {form.attributes.loading ? <Spinner label="Đang tải thuộc tính danh mục…" /> : form.attributes.error ? (
            <ErrorBox message={form.attributes.error} onRetry={form.attributes.reload} />
          ) : (
            <>
              <button type="button" onClick={() => form.setStep("media")} className="self-start font-button-text text-button-text text-primary hover:underline">
                ← Quay lại ảnh, video và mô tả
              </button>
              <PostDetailsForm
                values={form.details}
                attributes={form.attributeList}
                errors={form.fieldErrors}
                busy={form.busy}
                profileError={null}
                onChange={form.changeDetails}
                onBack={() => form.setStep("media")}
                onSubmit={form.submit}
                hideFooter
              />
              <div className="flex flex-wrap justify-end gap-space-sm">
                <button type="button" onClick={form.cancel} disabled={form.busy} className="h-11 rounded-xl border border-outline-variant px-space-lg font-button-text text-button-text text-on-surface disabled:opacity-50">Hủy bỏ</button>
                <button type="button" onClick={() => setPreviewOpen(true)} disabled={form.busy} className="h-11 rounded-xl border border-primary px-space-lg font-button-text text-button-text text-primary disabled:opacity-50">Xem trước thay đổi</button>
                <button type="button" onClick={form.submit} disabled={form.busy} className="inline-flex h-11 items-center gap-space-xs rounded-xl bg-primary-container px-space-xl font-button-text text-button-text text-on-primary disabled:opacity-50">
                  {form.busy ? "Đang lưu…" : "Lưu thay đổi"}
                  {!form.busy && <MaterialIcon name="save" size={18} />}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {form.latestSavedLabel && post.trangThai !== "DaBan" && (
        <p className="m-0 text-right font-caption text-caption text-on-surface-variant" role="status">{form.latestSavedLabel}</p>
      )}
      {form.formError && form.step !== "media" && (
        <p className="m-0 rounded-lg bg-error-container px-space-md py-space-sm font-body-2 text-body-2 text-on-error-container" role="alert">{form.formError}</p>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-space-md" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPreviewOpen(false);
        }}>
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-surface-container-lowest p-space-lg shadow-xl" role="dialog" aria-modal="true" aria-labelledby="post-edit-preview-title">
            <div className="mb-space-md flex items-center justify-between gap-space-sm">
              <h2 id="post-edit-preview-title" className="m-0 font-headline-3 text-headline-3 text-on-surface">Xem trước thay đổi</h2>
              <button type="button" aria-label="Đóng xem trước" onClick={() => setPreviewOpen(false)} className="rounded-lg p-space-xs text-on-surface-variant hover:bg-surface-container-low">
                <MaterialIcon name="close" />
              </button>
            </div>
            {cover && (
              cover.laVideo
                ? <video src={imgSrc(cover.duongDan)} controls className="mb-space-md aspect-video w-full rounded-lg bg-surface-container object-cover" />
                : <img src={imgSrc(cover.duongDan)} alt="Ảnh bìa tin đăng" onError={onImgError} className="mb-space-md aspect-video w-full rounded-lg bg-surface-container object-cover" />
            )}
            <h3 className="mb-space-xs mt-0 font-headline-3 text-headline-3 text-on-surface">
              {form.details.tieuDe.trim() || `Tiêu đề sẽ được hệ thống tự tạo`}
            </h3>
            <p className="mb-space-sm mt-0 font-button-text text-button-text text-primary">{formatPrice(Number(form.details.gia) || 0)}</p>
            <p className="m-0 whitespace-pre-wrap font-body-2 text-body-2 text-on-surface-variant">{form.details.moTa}</p>
            <div className="mt-space-lg flex justify-end">
              <button type="button" onClick={() => setPreviewOpen(false)} className="h-10 rounded-lg bg-primary-container px-space-lg font-button-text text-button-text text-on-primary">Đóng</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
