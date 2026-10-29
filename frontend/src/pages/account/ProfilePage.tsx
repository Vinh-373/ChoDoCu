import { useEffect, useState, type FormEvent } from "react";
import { nguoiDungApi } from "../../api/nguoiDung";
import AddressFields from "../../components/account/AddressFields";
import { Card, SectionTitle, TextArea, TextInput } from "../../components/account/FormControls";
import FormAlert from "../../components/auth/FormAlert";
import MaterialIcon from "../../components/common/MaterialIcon";
import { Spinner } from "../../components/common/State";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import type { HoSoNguoiDung } from "../../types";
import { getErrorMessage } from "../../utils/error";

const GENDERS = ["Nam", "Nữ", "Khác"] as const;
const BIO_MAX = 500;

interface FormState {
  hoTen: string;
  tenGianHang: string;
  idThanhPho: string;
  idPhuongXa: string;
  diaChiChiTiet: string;
  gioiThieu: string;
  gioiTinh: string;
  ngaySinh: string;
}

const toForm = (p: Partial<HoSoNguoiDung>): FormState => ({
  hoTen: p.hoTen ?? "",
  tenGianHang: p.tenGianHang ?? "",
  idThanhPho: p.idThanhPho ? String(p.idThanhPho) : "",
  idPhuongXa: p.idPhuongXa ? String(p.idPhuongXa) : "",
  diaChiChiTiet: p.diaChiChiTiet ?? "",
  gioiThieu: p.gioiThieu ?? "",
  gioiTinh: p.gioiTinh ?? "",
  ngaySinh: (p.ngaySinh ?? "").slice(0, 10),
});

/** Hồ sơ cá nhân & cài đặt tài khoản (/tai-khoan). */
export default function ProfilePage() {
  useDocumentTitle("Hồ sơ cá nhân");
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const { data: profile, loading, error } = useFetch(() => nguoiDungApi.layHoSo(), []);
  const [saved, setSaved] = useState<Partial<HoSoNguoiDung>>({});
  const [form, setForm] = useState<FormState>(toForm({ hoTen: user?.hoTen }));
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setSaved(profile);
    setForm(toForm(profile));
  }, [profile]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(saved.hoTen ? saved : { hoTen: user?.hoTen }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.hoTen.trim()) return setFormError("Họ và tên không được để trống.");
    setFormError("");
    setBusy(true);
    try {
      const updated = await nguoiDungApi.capNhatHoSo({
        hoTen: form.hoTen.trim(),
        tenGianHang: form.tenGianHang.trim() || null,
        soDienThoai: saved.soDienThoai ?? null,
        idThanhPho: form.idThanhPho ? Number(form.idThanhPho) : null,
        idPhuongXa: form.idPhuongXa ? Number(form.idPhuongXa) : null,
        diaChiChiTiet: form.diaChiChiTiet.trim() || null,
        gioiThieu: form.gioiThieu.trim() || null,
        gioiTinh: (GENDERS as readonly string[]).includes(form.gioiTinh) ? (form.gioiTinh as HoSoNguoiDung["gioiTinh"]) : null,
        ngaySinh: form.ngaySinh || null,
      });
      const next = updated?.hoTen ? updated : { ...saved, hoTen: form.hoTen.trim() };
      setSaved(next);
      setForm(toForm(next));
      updateUser({ hoTen: form.hoTen.trim() });
      toast("Đã lưu thay đổi.", "ok");
    } catch (err) {
      setFormError(getErrorMessage(err, "Chưa lưu được thay đổi. Vui lòng thử lại."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <form onSubmit={submit} className="max-w-3xl mx-auto flex flex-col gap-space-lg pb-space-xl">
      <Card className="p-space-xl">
        <h1 className="m-0 font-headline-1 text-headline-1 text-on-surface">Hồ sơ cá nhân & Cài đặt tài khoản</h1>
        <p className="m-0 mt-space-2xs font-body-2 text-body-2 text-on-surface-variant">
          Cập nhật thông tin định danh, tên gian hàng và thông tin bảo mật tài khoản của bạn.
        </p>
      </Card>

      {error && <FormAlert message={`Chưa tải được hồ sơ từ máy chủ (${error}). Bạn vẫn có thể sửa họ tên và lưu.`} />}

      <Card className="p-space-xl flex flex-col gap-space-lg">
        <SectionTitle icon="person">1. Thông tin cá nhân</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
          <TextInput
            id="ho-ten"
            label="Họ và tên"
            required
            value={form.hoTen}
            onChange={(e) => set("hoTen", e.target.value)}
            autoComplete="name"
            trailing={form.hoTen.trim() ? <MaterialIcon name="check_circle" size={18} className="text-secondary" /> : undefined}
          />
          <TextInput
            id="ten-gian-hang"
            label="Tên của trang"
            aside="Tên gian hàng bán đồ cũ"
            value={form.tenGianHang}
            onChange={(e) => set("tenGianHang", e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="flex flex-col gap-space-2xs">
          <label htmlFor="so-dien-thoai" className="font-caption-bold text-caption-bold text-on-surface">
            Số điện thoại liên lạc
          </label>
          <div className="flex items-stretch gap-space-sm">
            <div className="relative flex-1 min-w-0 flex items-center">
              <MaterialIcon name="call" size={18} className="absolute left-space-md text-on-surface-variant pointer-events-none" />
              <input
                id="so-dien-thoai"
                readOnly
                value={saved.soDienThoai ?? ""}
                placeholder="Chưa có số điện thoại"
                className="w-full h-12 pl-10 pr-space-md bg-surface-container rounded-xl border-0 font-button-text text-button-text text-on-surface cursor-not-allowed focus:outline-none"
              />
              {saved.soDienThoaiDaXacThuc && (
                <span className="absolute right-space-md hidden sm:inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-surface-container-lowest text-secondary font-caption-bold text-caption-bold">
                  <MaterialIcon name="check_circle" size={14} filled /> Đã xác thực
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => toast("Đổi số điện thoại cần xác thực OTP, tính năng này chưa được hỗ trợ.", "info")}
              className="px-space-lg rounded-xl border-0 cursor-pointer bg-surface-container-high hover:bg-surface-variant font-button-text text-button-text text-on-surface transition-colors"
            >
              Đổi SĐT
            </button>
          </div>
        </div>

        <AddressFields
          idThanhPho={form.idThanhPho}
          idPhuongXa={form.idPhuongXa}
          diaChiChiTiet={form.diaChiChiTiet}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        />

        <TextArea
          id="gioi-thieu"
          label="Giới thiệu"
          rows={4}
          maxLength={BIO_MAX}
          value={form.gioiThieu}
          onChange={(e) => set("gioiThieu", e.target.value)}
          aside={`${form.gioiThieu.length}/${BIO_MAX}`}
          hint="Mô tả ngắn về bản thân, kinh nghiệm mua bán đồ cũ, uy tín và giờ xem hàng trực tiếp."
        />
      </Card>

      <Card className="p-space-xl flex flex-col gap-space-lg">
        <SectionTitle icon="shield_lock">2. Thông tin bảo mật</SectionTitle>

        <div className="flex flex-col gap-space-2xs">
          <label htmlFor="email" className="font-caption-bold text-caption-bold text-on-surface">
            Email đăng nhập
          </label>
          <div className="relative flex items-center">
            <MaterialIcon name="mail" size={18} className="absolute left-space-md text-on-surface-variant pointer-events-none" />
            <input
              id="email"
              type="email"
              readOnly
              value={saved.email ?? ""}
              placeholder="Chưa có email"
              className="w-full h-12 pl-10 pr-11 bg-surface-container rounded-xl border-0 font-body-2 text-body-2 text-on-surface cursor-not-allowed focus:outline-none"
            />
            <MaterialIcon name="lock" size={18} className="absolute right-space-md text-on-surface-variant" />
          </div>
          <span className="font-caption text-caption text-on-surface-variant">Email dùng để đăng nhập và nhận liên kết khôi phục mật khẩu, nên không thể sửa tại đây.</span>
        </div>

        {saved.cccdDaMa && (
          <div className="flex flex-col gap-space-2xs">
            <label htmlFor="cccd" className="font-caption-bold text-caption-bold text-on-surface">
              Căn cước công dân (CCCD)
            </label>
            <div className="relative flex items-center">
              <input id="cccd" readOnly value={saved.cccdDaMa} className="w-full h-12 px-space-md pr-11 bg-surface-container rounded-xl border-0 font-body-2 text-body-2 text-on-surface-variant cursor-not-allowed focus:outline-none" />
              <MaterialIcon name="lock" size={18} className="absolute right-space-md text-on-surface-variant" />
            </div>
            <span className="font-caption text-caption text-on-surface-variant">Thông tin CCCD đã được mã hóa và không thể chỉnh sửa tại đây.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg items-start">
          <fieldset className="m-0 p-0 border-0 flex flex-col gap-space-xs">
            <legend className="p-0 mb-space-xs font-caption-bold text-caption-bold text-on-surface">Giới tính</legend>
            <div className="flex items-center gap-space-lg h-11">
              {GENDERS.map((g) => (
                <label key={g} className="inline-flex items-center gap-space-xs cursor-pointer font-body-2 text-body-2 text-on-surface">
                  <input type="radio" name="gioi-tinh" value={g} checked={form.gioiTinh === g} onChange={() => set("gioiTinh", g)} className="w-4 h-4 accent-primary-container cursor-pointer" />
                  {g}
                </label>
              ))}
            </div>
          </fieldset>
          <TextInput id="ngay-sinh" label="Ngày tháng năm sinh" type="date" max={new Date().toISOString().slice(0, 10)} value={form.ngaySinh} onChange={(e) => set("ngaySinh", e.target.value)} />
        </div>
      </Card>

      {formError && <FormAlert message={formError} />}

      <Card className="p-space-md sm:px-space-xl flex items-center justify-between gap-space-md sticky bottom-space-md z-10">
        <span className="hidden sm:inline-flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
          <MaterialIcon name={dirty ? "edit_note" : "cloud_done"} size={18} className={dirty ? "text-tertiary" : "text-secondary"} />
          {dirty ? "Bạn có thay đổi chưa lưu" : "Mọi thay đổi đã được lưu"}
        </span>
        <div className="flex items-center gap-space-sm ml-auto">
          <button
            type="button"
            disabled={!dirty || busy}
            onClick={() => setForm(toForm(saved.hoTen ? saved : { hoTen: user?.hoTen }))}
            className="h-11 px-space-lg rounded-xl border-0 cursor-pointer bg-surface-container-high hover:bg-surface-variant font-button-text text-button-text text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={!dirty || busy}
            className="h-11 px-space-xl rounded-xl border-0 cursor-pointer bg-primary-container hover:bg-primary text-on-primary font-button-text text-button-text shadow-md inline-flex items-center gap-space-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <MaterialIcon name={busy ? "progress_activity" : "save"} size={18} className={busy ? "animate-spin" : ""} />
            {busy ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </div>
      </Card>
    </form>
  );
}