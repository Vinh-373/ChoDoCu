import type { DanhMuc } from "../../types";
import CategorySelect from "../common/CategorySelect";
import MaterialIcon from "../common/MaterialIcon";

export type PostSort = "moiNhat" | "cuNhat" | "giaTang" | "giaGiam" | "xemNhieu";

interface Props {
  keyword: string;
  categoryId?: number;
  sort: PostSort;
  categories: DanhMuc[];
  categoryError?: string | null;
  onKeywordChange: (value: string) => void;
  onCategoryChange: (value: number | undefined) => void;
  onSortChange: (value: PostSort) => void;
}

const SORT_OPTIONS: { value: PostSort; label: string }[] = [
  { value: "moiNhat", label: "Mới nhất" },
  { value: "cuNhat", label: "Cũ nhất" },
  { value: "giaTang", label: "Giá tăng dần" },
  { value: "giaGiam", label: "Giá giảm dần" },
  { value: "xemNhieu", label: "Xem nhiều" },
];

export default function PostFilters({
  keyword, categoryId, sort, categories, categoryError, onKeywordChange, onCategoryChange, onSortChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-space-sm">
      <div className="relative flex-1 min-w-48 flex items-center">
        <MaterialIcon name="search" size={18} className="absolute left-space-md text-on-surface-variant pointer-events-none" />
        <input
          type="search"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Tìm kiếm theo tiêu đề tin"
          aria-label="Tìm trong tin của tôi"
          className="w-full h-10 pl-10 pr-space-md bg-surface-container-low rounded-xl border-0 font-body-2 text-body-2 focus:outline-none focus:shadow-[0_0_0_2px_#ff7a00]"
        />
      </div>
      <label className="sr-only" htmlFor="post-category-filter">Danh mục</label>
      <CategorySelect
        id="post-category-filter"
        tree={categories}
        value={categoryId}
        onChange={onCategoryChange}
        placeholder="Tất cả danh mục"
      />
      <label className="sr-only" htmlFor="post-sort">Sắp xếp</label>
      <select
        id="post-sort"
        value={sort}
        onChange={(event) => onSortChange(event.target.value as PostSort)}
        className="h-10 rounded-xl border-0 bg-surface-container-low px-space-md font-button-text text-button-text text-on-surface"
      >
        {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {categoryError && <p className="m-0 basis-full font-caption text-caption text-error" role="alert">{categoryError}</p>}
    </div>
  );
}
