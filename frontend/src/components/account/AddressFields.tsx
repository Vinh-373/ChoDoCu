import { diaChiApi } from "../../api/diaChi";
import { useFetch } from "../../hooks/useFetch";
import MaterialIcon from "../common/MaterialIcon";
import { ErrorBox } from "../common/State";
import { SelectInput, TextInput } from "./FormControls";

interface Props {
  idThanhPho: string;
  idPhuongXa: string;
  diaChiChiTiet: string;
  required?: boolean;
  onChange: (patch: { idThanhPho?: string; idPhuongXa?: string; diaChiChiTiet?: string }) => void;
}

/** Địa chỉ: chọn tỉnh/thành, chọn xã/phường thuộc tỉnh đó, rồi nhập số nhà, đường. */
export default function AddressFields({ idThanhPho, idPhuongXa, diaChiChiTiet, required, onChange }: Props) {
  const cities = useFetch(() => diaChiApi.thanhPho(), []);
  const wards = useFetch(() => (idThanhPho ? diaChiApi.phuongXa(Number(idThanhPho)) : Promise.resolve([])), [idThanhPho]);
  const wardList = wards.data ?? [];

  return (
    <div className="flex flex-col gap-space-lg">
      {cities.error ? <ErrorBox message={cities.error} onRetry={cities.reload} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
          <SelectInput
            id="tinh-thanh"
            label="Tỉnh / Thành phố"
            required={required}
            disabled={cities.loading || (cities.data?.length ?? 0) === 0}
            value={idThanhPho}
            onChange={(e) => onChange({ idThanhPho: e.target.value, idPhuongXa: "" })}
          >
            <option value="">{cities.loading ? "Đang tải…" : cities.data?.length ? "Chọn tỉnh / thành phố" : "Chưa có dữ liệu tỉnh / thành phố"}</option>
            {(cities.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.tenThanhPho}
              </option>
            ))}
          </SelectInput>
          {idThanhPho && (wards.error ? (
            <ErrorBox message={wards.error} onRetry={wards.reload} />
          ) : (
            <SelectInput
              id="xa-phuong"
              label="Xã / Phường"
              value={idPhuongXa}
              disabled={wards.loading || wardList.length === 0}
              onChange={(e) => onChange({ idPhuongXa: e.target.value })}
            >
              <option value="">{wards.loading ? "Đang tải…" : wardList.length ? "Chọn xã / phường" : "Chưa có dữ liệu xã / phường"}</option>
              {wardList.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.tenPhuongXa}
                </option>
              ))}
            </SelectInput>
          ))}
        </div>
      )}
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