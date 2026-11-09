import type { DanhMucThuocTinh } from "../types";

interface AutoTitleAttributes {
  hang: DanhMucThuocTinh;
  dong: DanhMucThuocTinh;
  nam: DanhMucThuocTinh;
}

function findAttribute(attributes: DanhMucThuocTinh[], name: string): DanhMucThuocTinh | undefined {
  return attributes.find((attribute) => attribute.tenThuocTinh.toLowerCase() === name.toLowerCase());
}

export function getAutoTitleAttributes(attributes: DanhMucThuocTinh[]): AutoTitleAttributes | null {
  const hang = findAttribute(attributes, "Hãng xe");
  const dong = findAttribute(attributes, "Dòng xe");
  const nam = findAttribute(attributes, "Năm sản xuất");
  return hang && dong && nam ? { hang, dong, nam } : null;
}

export function getAutoTitlePreview(
  attributes: DanhMucThuocTinh[],
  values: Record<number, string>,
): string | null {
  const fields = getAutoTitleAttributes(attributes);
  if (!fields) return null;

  const hangValue = values[fields.hang.id];
  const dongValue = values[fields.dong.id];
  const namValue = values[fields.nam.id]?.trim();
  if (!hangValue || !dongValue || !namValue) return null;

  const hang = fields.hang.danhSachLuaChon.find((option) => option.giaTri === hangValue)?.ten;
  const dong = fields.dong.danhSachLuaChon.find((option) => option.giaTri === dongValue)?.ten;
  return hang && dong ? `${hang} ${dong} ${namValue}` : null;
}
