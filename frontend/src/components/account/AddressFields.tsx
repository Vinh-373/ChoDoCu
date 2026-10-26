import { diaChiApi } from "../../api/diaChi";
import { useFetch } from "../../hooks/useFetch";
import MaterialIcon from "../common/MaterialIcon";
import { SelectInput, TextInput } from "./FormControls";

interface Props {
  idThanhPho: string;
  idPhuongXa: string;
  diaChiChiTiet: string;
  onChange: (patch: { idThanhPho?: string; idPhuongXa?: string; diaChiChiTiet?: string }) => void;
}

/** Địa chỉ: chọn tỉnh/thành, chọn xã/phường thuộc tỉnh đó, rồi nhập số nhà, đường. */
export default function AddressFields({ idThanhPho, idPhuongXa, diaChiChiTiet, onChange }: Props) {
  const cities = useFetch(() => diaChiApi.thanhPho(), []);
  const wards = useFetch(() => (idThanhPho ? diaChiApi.phuongXa(Number(idThanhPho)) : Promise.resolve([])), [idThanhPho]);
  const wardList = wards.data ?? [];

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
        <SelectInput
          id="tinh-thanh"
          label="Tỉnh / Thành phố"
          value={idThanhPho}
          onChange={(e) => onChange({ idThanhPho: e.target.value, idPhuongXa: "" })}
        >
          <option value="">Chọn tỉnh / thành phố</option>
          {(cities.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.tenThanhPho}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          id="xa-phuong"
          label="Xã / Phường"
          value={idPhuongXa}
          disabled={!idThanhPho || wards.loading || wardList.length === 0}
          onChange={(e) => onChange({ idPhuongXa: e.target.value })}
        >
          <option value="">{!idThanhPho ? "Chọn tỉnh / thành phố trước" : wards.loading ? "Đang tải…" : "Chọn xã / phường"}</option>
          {wardList.map((w) => (
            <option key={w.id} value={w.id}>
              {w.tenPhuongXa}
            </option>
          ))}
        </SelectInput>
      </div>
      <TextInput
        id="dia-chi-chi-tiet"
        label="Địa chỉ chi tiết"
        placeholder="Số nhà, tên đường, tổ/khu phố…"
        maxLength={255}
        value={diaChiChiTiet}
        onChange={(e) => onChange({ diaChiChiTiet: e.target.value })}
        autoComplete="address-line1"
        trailing={<MaterialIcon name="location_on" size={18} />}
      />
    </div>
  );
}