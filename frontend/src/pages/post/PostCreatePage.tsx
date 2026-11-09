import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import useQuota from "../../hooks/useQuota";
import { ErrorBox, Spinner } from "../../components/common/State";
import PostCategoryStep from "../../components/post/PostCategoryStep";
import PostDetailsForm from "../../components/post/PostDetailsForm";
import PostMediaForm from "../../components/post/PostMediaForm";
import usePostForm from "./usePostForm";

export default function PostCreatePage() {
  useDocumentTitle("Đăng tin");
  const form = usePostForm();
  const quota = useQuota();

  return (
    <main className="mx-auto w-full max-w-7xl px-margin py-space-xl">
      {form.step === 0 && (
        <div className="flex flex-col gap-space-md">
          <p className="m-0 text-center font-caption text-caption text-on-surface-variant">
            {quota.loading ? "Đang tải lượt đăng…" : `Bạn còn ${quota.luotDang} lượt đăng`}
          </p>
          {quota.error && <p className="m-0 text-center font-caption text-caption text-error" role="alert">{quota.error}</p>}
          <PostCategoryStep
            categories={form.categories}
            parentId={form.parentId}
            childId={form.childId}
            error={form.categoryError}
            onChooseParent={form.chooseParent}
            onChooseChild={form.chooseChild}
            onContinue={form.continueCategory}
          />
        </div>
      )}

      {form.step === 1 && form.selectedCategory && form.selectedParent && (
        <PostMediaForm
          categoryLabel={[form.selectedParent.tenDanhMuc, form.selectedCategory.id === form.selectedParent.id ? "" : form.selectedCategory.tenDanhMuc].filter(Boolean).join(" > ")}
          details={form.details}
          media={form.media}
          coverId={form.coverPhoto?.id ?? null}
          uploadBusy={form.uploadBusy}
          error={form.formError}
          fieldError={form.fieldErrors.moTa ?? ""}
          onChange={form.changeDetails}
          onFilesSelected={form.addFiles}
          onRemove={form.removeMedia}
          onRetry={form.uploadOne}
          onSetCover={form.setCover}
          onChangeCategory={() => form.setStep(0)}
          onContinue={form.continueMedia}
          onBack={() => { form.setFormError(""); form.setStep(0); }}
        />
      )}

      {form.step === 2 && (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-space-lg">
          {form.attributes.loading ? <Spinner label="Đang tải thuộc tính danh mục…" /> : form.attributes.error ? (
            <ErrorBox message={form.attributes.error} onRetry={form.attributes.reload} />
          ) : (
            <PostDetailsForm
              values={form.details}
              attributes={form.attributeList}
              errors={form.fieldErrors}
              busy={form.busy}
              profileError={form.profileError}
              submitDisabled={quota.loading || (!quota.error && quota.luotDang === 0)}
              onChange={form.changeDetails}
              onBack={() => { form.setFormError(""); form.setStep(1); }}
              onSubmit={form.submit}
            />
          )}
          {form.formError && <p className="m-0 rounded-lg bg-error-container px-space-md py-space-sm font-body-2 text-body-2 text-on-error-container" role="alert">{form.formError}</p>}
          {quota.error && <p className="m-0 font-caption text-caption text-error" role="alert">{quota.error}</p>}
          {quota.luotDang === 0 && !quota.loading && !quota.error && (
            <p className="m-0 rounded-lg border border-tertiary-container bg-tertiary-fixed px-space-md py-space-sm font-body-2 text-body-2 text-on-tertiary-fixed" role="status">
              Bạn đã hết lượt đăng.{" "}
              <Link to="/dich-vu" className="font-caption-bold text-caption-bold text-primary underline">Mua thêm lượt</Link>
            </p>
          )}
          {form.quotaMessage && (
            <p className="m-0 rounded-lg bg-tertiary-fixed px-space-md py-space-sm font-body-2 text-body-2 text-on-tertiary-fixed">
              {form.quotaMessage}{" "}
              <Link to="/dich-vu" className="font-caption-bold text-caption-bold text-primary underline">Xem gói dịch vụ</Link>
            </p>
          )}
        </div>
      )}
    </main>
  );
}
