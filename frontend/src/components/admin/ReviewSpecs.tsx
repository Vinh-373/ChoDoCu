import type { BaiDangThuocTinhResponse } from "../../types";

export default function ReviewSpecs({ items }: { items?: BaiDangThuocTinhResponse[] | null }) {
  return (
    <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
      <h2 className="mb-space-md mt-0 font-headline-3 text-headline-3 text-on-surface">Thông số kỹ thuật</h2>
      {items?.length ? (
        <dl className="m-0 grid grid-cols-1 gap-x-space-lg sm:grid-cols-2">
          {items.map((item, index) => (
            <div key={`${item.tenThuocTinh}-${index}`} className="flex justify-between gap-space-md border-b border-outline-variant py-space-sm">
              <dt className="text-caption text-on-surface-variant">{item.tenThuocTinh}</dt>
              <dd className="m-0 text-right font-caption-bold text-caption-bold text-on-surface">{item.tenGiaTri}</dd>
            </div>
          ))}
        </dl>
      ) : <p className="mb-0 text-body-2 text-on-surface-variant">Chưa có thông số kỹ thuật.</p>}
    </section>
  );
}
