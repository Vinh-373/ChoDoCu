import { diaChiApi } from "../../api/diaChi";
import { useFetch } from "../../hooks/useFetch";

interface Props {
  idThanhPho: number | undefined;
  idPhuongXa: number | undefined;
  onChange: (value: { idThanhPho?: number; idPhuongXa?: number; tenThanhPho?: string; tenPhuongXa?: string }) => void;
  showWard?: boolean;
  cityPlaceholder?: string;
  required?: boolean;
}

/** Chọn thành phố, rồi (tuỳ chọn) phường/xã thuộc thành phố đó. */
export default function LocationFields({
  idThanhPho,
  idPhuongXa,
  onChange,
  showWard = true,
  cityPlaceholder = "Tất cả thành phố",
  required,
}: Props) {
  const cities = useFetch(() => diaChiApi.thanhPho(), []);
  const wards = useFetch(
    () => (idThanhPho && showWard ? diaChiApi.phuongXa(idThanhPho) : Promise.resolve([])),
    [idThanhPho, showWard],
  );

  const cityList = cities.data ?? [];
  const wardList = wards.data ?? [];

  return (
    <>
      <select
        aria-label="Thành phố"
        required={required}
        value={idThanhPho ?? ""}
        onChange={(e) => {
          const id = e.target.value ? Number(e.target.value) : undefined;
          onChange({ idThanhPho: id, idPhuongXa: undefined, tenThanhPho: cityList.find((c) => c.id === id)?.tenThanhPho });
        }}
      >
        <option value="">{cityPlaceholder}</option>
        {cityList.map((c) => (
          <option key={c.id} value={c.id}>
            {c.tenThanhPho}
          </option>
        ))}
      </select>
      {showWard && (
        <select
          aria-label="Phường/xã"
          value={idPhuongXa ?? ""}
          disabled={!idThanhPho || wardList.length === 0}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : undefined;
            onChange({
              idThanhPho,
              idPhuongXa: id,
              tenThanhPho: cityList.find((c) => c.id === idThanhPho)?.tenThanhPho,
              tenPhuongXa: wardList.find((w) => w.id === id)?.tenPhuongXa,
            });
          }}
        >
          <option value="">Phường/xã (không bắt buộc)</option>
          {wardList.map((w) => (
            <option key={w.id} value={w.id}>
              {w.tenPhuongXa}
            </option>
          ))}
        </select>
      )}
    </>
  );
}
