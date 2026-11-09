interface Props {
  keyword: string;
  categoryId: string;
  categories: { id: number; label: string }[];
  onKeywordChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export default function AdminApproveFilters({
  keyword, categoryId, categories, onKeywordChange, onCategoryChange,
}: Props) {
  return (
    <div className="panel row">
      <div className="field">
        <label htmlFor="approve-search">Tìm bài đăng</label>
        <input
          id="approve-search"
          type="search"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Tìm theo mã tin hoặc tiêu đề"
        />
      </div>
      <div className="field">
        <label htmlFor="approve-category">Danh mục</label>
        <select
          id="approve-category"
          value={categoryId}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
