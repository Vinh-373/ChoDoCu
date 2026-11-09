import type { FormEvent } from "react";
import type { DanhMuc } from "../../types";
import CategorySelect from "../common/CategorySelect";
import LocationFields from "../common/LocationFields";
import PriceRangeFilter from "./PriceRangeFilter";

interface Props {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  history: string[];
  onHistorySelect: (keyword: string) => void;
  categories: DanhMuc[];
  idDanhMuc?: number;
  onCategoryChange: (id?: number) => void;
  idThanhPho?: number;
  idPhuongXa?: number;
  onLocationChange: (value: { idThanhPho?: number; idPhuongXa?: number }) => void;
  giaTu?: number;
  giaDen?: number;
  onPriceChange: (range: { giaTu?: number; giaDen?: number }) => void;
  hasFilter: boolean;
  onClear: () => void;
}

export default function SearchFilters({
  keyword,
  onKeywordChange,
  onSubmit,
  history,
  onHistorySelect,
  categories,
  idDanhMuc,
  onCategoryChange,
  idThanhPho,
  idPhuongXa,
  onLocationChange,
  giaTu,
  giaDen,
  onPriceChange,
  hasFilter,
  onClear,
}: Props) {
  return (
    <aside className="filters panel stack" aria-label="Bộ lọc">
      <form className="field" onSubmit={onSubmit}>
        <label htmlFor="kw">Từ khoá</label>
        <input
          id="kw"
          type="search"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Ví dụ: iPhone 12"
        />
        <button className="btn btn-sm">Tìm</button>
      </form>

      {history.length > 0 && (
        <div className="field">
          <span className="label">Bạn đã tìm gần đây</span>
          <div className="history">
            {history.map((item) => (
              <button key={item} type="button" className="chip" onClick={() => onHistorySelect(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="dm">Danh mục</label>
        <CategorySelect id="dm" tree={categories} value={idDanhMuc} onChange={onCategoryChange} />
      </div>

      <div className="field">
        <span className="label">Khu vực</span>
        <LocationFields
          idThanhPho={idThanhPho}
          idPhuongXa={idPhuongXa}
          showWard
          onChange={({ idThanhPho: cityId, idPhuongXa: wardId }) => onLocationChange({
            idThanhPho: cityId,
            idPhuongXa: wardId,
          })}
        />
      </div>

      <PriceRangeFilter giaTu={giaTu} giaDen={giaDen} onChange={onPriceChange} />

      {hasFilter && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
          Xóa bộ lọc
        </button>
      )}
    </aside>
  );
}
