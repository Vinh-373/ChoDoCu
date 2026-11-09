import type { DanhMuc } from "../../types";
import { imgSrc, onImgError } from "../../utils/image";
import MaterialIcon from "../common/MaterialIcon";
import { Empty, ErrorBox, Spinner } from "../common/State";

interface Props {
  categories: { data: DanhMuc[] | null; loading: boolean; error: string | null; reload: () => void };
  parentId: number | null;
  childId: number | null;
  error: string;
  onChooseParent: (id: number) => void;
  onChooseChild: (id: number) => void;
  onContinue: () => void;
}

export default function PostCategoryStep({
  categories, parentId, childId, error, onChooseParent, onChooseChild, onContinue,
}: Props) {
  const selected = categories.data?.find((item) => item.id === parentId);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-space-lg">
      <header className="text-center">
        <p className="m-0 font-caption-bold text-caption-bold uppercase tracking-wide text-primary">Bước 1 / 3</p>
        <h1 className="mb-space-2xs mt-space-xs font-headline-1 text-headline-1 text-on-surface">Bạn muốn đăng bán gì?</h1>
        <p className="m-0 font-body-2 text-body-2 text-on-surface-variant">Chọn danh mục phù hợp để người mua dễ tìm thấy tin của bạn.</p>
      </header>

      {categories.loading ? <Spinner label="Đang tải danh mục…" /> : categories.error ? (
        <ErrorBox message={categories.error} onRetry={categories.reload} />
      ) : !categories.data?.length ? (
        <Empty title="Chưa có danh mục đăng tin" />
      ) : (
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-3">
          {categories.data.map((item) => {
            const active = item.id === parentId;
            return (
              <button
                type="button"
                key={item.id}
                aria-pressed={active}
                onClick={() => onChooseParent(item.id)}
                className={`flex min-h-32 items-center gap-space-md rounded-xl border p-space-lg text-left transition-colors ${
                  active ? "border-primary bg-primary-fixed/40" : "border-outline-variant bg-surface-container-lowest hover:border-primary"
                }`}
              >
                <img
                  src={imgSrc(item.anhDanhMuc)}
                  alt=""
                  onError={onImgError}
                  className="h-16 w-16 shrink-0 rounded-lg bg-surface-container object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-button-text text-button-text text-on-surface">{item.tenDanhMuc}</span>
                  {item.danhMucCons.length > 0 && (
                    <span className="mt-space-2xs block font-caption text-caption text-on-surface-variant">
                      {item.danhMucCons.map((child) => child.tenDanhMuc).join(" · ")}
                    </span>
                  )}
                </span>
                <MaterialIcon name="chevron_right" className="text-on-surface-variant" />
              </button>
            );
          })}
        </div>
      )}

      {selected && selected.danhMucCons.length > 0 && (
        <section className="rounded-xl bg-surface-container-low p-space-lg" aria-label="Danh mục con">
          <h2 className="mb-space-md mt-0 font-headline-3 text-headline-3 text-on-surface">{selected.tenDanhMuc}: chọn danh mục con</h2>
          <div className="flex flex-wrap gap-space-sm">
            {selected.danhMucCons.map((child) => (
              <button
                type="button"
                key={child.id}
                aria-pressed={child.id === childId}
                onClick={() => onChooseChild(child.id)}
                className={`rounded-full border px-space-lg py-space-sm font-button-text text-button-text transition-colors ${
                  child.id === childId ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary"
                }`}
              >
                {child.tenDanhMuc}
              </button>
            ))}
          </div>
        </section>
      )}

      {error && <p className="m-0 font-caption text-caption text-error" role="alert">{error}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          disabled={categories.loading || !!categories.error || !categories.data?.length}
          className="inline-flex h-11 items-center gap-space-xs rounded-xl bg-primary-container px-space-xl font-button-text text-button-text text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tiếp tục <MaterialIcon name="arrow_forward" size={18} />
        </button>
      </div>

      <footer className="flex flex-col items-center gap-space-2xs border-t border-outline-variant pt-space-lg font-caption text-caption text-on-surface-variant sm:flex-row sm:justify-center sm:gap-space-sm">
        <span>Cần trợ giúp khi đăng tin?</span>
        <a href="/quy-dinh-duyet-tin" className="font-caption-bold text-caption-bold text-primary hover:underline">Xem quy định duyệt tin</a>
      </footer>
    </div>
  );
}
