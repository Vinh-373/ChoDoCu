import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { diaChiApi } from "../../api/diaChi";
import { useFetch } from "../../hooks/useFetch";
import MaterialIcon from "../common/MaterialIcon";

/** Ô tìm kiếm trên header: chọn khu vực (thành phố) + từ khoá → /tim-kiem?q=…&thanhPho=… */
export default function SearchBar() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const cities = useFetch(() => diaChiApi.thanhPho(), []);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  // Đang ở trang tìm kiếm thì đồng bộ ô tìm với URL.
  useEffect(() => {
    if (pathname !== "/tim-kiem") return;
    const p = new URLSearchParams(search);
    setQ(p.get("q") ?? "");
    setCity(p.get("thanhPho") ?? "");
  }, [pathname, search]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (city) p.set("thanhPho", city);
    const qs = p.toString();
    navigate(qs ? `/tim-kiem?${qs}` : "/tim-kiem");
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className="flex items-center w-full h-12 bg-surface-container-low rounded-xl px-space-2xs transition-all focus-within:bg-surface-container-lowest focus-within:shadow-[0_0_0_2px_#ff7a00]"
    >
      <label className="relative flex items-center shrink-0 pl-space-md">
        <MaterialIcon name="location_on" size={18} className="text-primary-container pointer-events-none" />
        <select
          aria-label="Khu vực"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="appearance-none bg-transparent border-0 pl-space-2xs pr-5 py-space-xs max-w-[9.5rem] truncate cursor-pointer font-caption-bold text-caption-bold text-on-surface focus:outline-none focus:shadow-none"
        >
          <option value="">Toàn quốc</option>
          {(cities.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.tenThanhPho}
            </option>
          ))}
        </select>
        <MaterialIcon name="arrow_drop_down" size={16} className="absolute right-0 text-on-surface-variant pointer-events-none" />
      </label>
      <div className="h-6 w-px bg-surface-variant mx-space-2xs shrink-0" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Từ khoá tìm kiếm"
        placeholder="Tìm kiếm đồ cũ, xe máy, điện thoại, nội thất..."
        className="flex-1 min-w-0 bg-transparent border-0 px-space-sm font-body-2 text-body-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:shadow-none"
      />
      <button
        type="submit"
        className="h-10 px-space-lg bg-primary-container text-on-primary font-button-text text-button-text rounded-lg border-0 cursor-pointer hover:bg-primary transition-colors flex items-center justify-center gap-space-2xs shadow-sm"
      >
        <MaterialIcon name="search" size={20} />
        <span className="hidden lg:inline">Tìm</span>
      </button>
    </form>
  );
}
