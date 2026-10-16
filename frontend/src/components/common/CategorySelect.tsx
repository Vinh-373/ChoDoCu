import type { DanhMuc } from "../../types";

interface Props {
  tree: DanhMuc[];
  value: number | undefined;
  onChange: (id: number | undefined) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
}

/**
 * Chỉ chọn được danh mục "lá": bài đăng gắn với danh mục con, và BE lọc theo đúng idDanhMuc của bài.
 * Danh mục gốc không có con thì tự nó là lá.
 */
export default function CategorySelect({ tree, value, onChange, placeholder = "Tất cả danh mục", id, required }: Props) {
  return (
    <select
      id={id}
      required={required}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
    >
      <option value="">{placeholder}</option>
      {tree.map((root) =>
        root.danhMucCons.length > 0 ? (
          <optgroup key={root.id} label={root.tenDanhMuc}>
            {root.danhMucCons.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tenDanhMuc}
              </option>
            ))}
          </optgroup>
        ) : (
          <option key={root.id} value={root.id}>
            {root.tenDanhMuc}
          </option>
        ),
      )}
    </select>
  );
}
