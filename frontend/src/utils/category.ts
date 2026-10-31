import type { DanhMuc } from "../types";

export interface FlatCategory {
  id: number;
  tenDanhMuc: string;
  label: string;
}

export const flattenCategories = (categories: DanhMuc[], depth = 0): FlatCategory[] =>
  categories.flatMap((category) => [
    { id: category.id, tenDanhMuc: category.tenDanhMuc, label: `${"— ".repeat(depth)}${category.tenDanhMuc}` },
    ...flattenCategories(category.danhMucCons, depth + 1),
  ]);
