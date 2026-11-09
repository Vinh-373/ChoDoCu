import AddressFields from "../account/AddressFields";
import MaterialIcon from "../common/MaterialIcon";
import PriceInput from "../common/PriceInput";
import { Field, SelectInput, TextInput } from "../account/FormControls";
import { MAX_TIEU_DE } from "../../constants/baiDang";
import type { DanhMucThuocTinh } from "../../types";
import type { PostDetailsValues } from "../../pages/post/usePostForm";
import { getAutoTitleAttributes, getAutoTitlePreview } from "../../utils/postTitle";

interface Props {
  values: PostDetailsValues;
  attributes: DanhMucThuocTinh[];
  errors: Record<string, string>;
  busy: boolean;
  profileError: string | null;
  onChange: (patch: Partial<PostDetailsValues>) => void;
  onBack: () => void;
  onSubmit: () => void;
  hideFooter?: boolean;
  submitDisabled?: boolean;
}

export default function PostDetailsForm({
  values, attributes, errors, busy, profileError, onChange, onBack, onSubmit, hideFooter = false, submitDisabled = false,
}: Props) {
  const setAttribute = (attribute: DanhMucThuocTinh, value: string) => {
    const next = { ...values.thuocTinhs, [attribute.id]: value };
    const clearChildren = (parentId: number) => {
      for (const child of attributes.filter((item) => item.idThuocTinhCha === parentId)) {
        delete next[child.id];
        clearChildren(child.id);
      }
    };
    if (values.thuocTinhs[attribute.id] !== value) clearChildren(attribute.id);
    onChange({ thuocTinhs: next });
  };
  const canAutoGenerateTitle = getAutoTitleAttributes(attributes) !== null;
  const titlePreview = values.tieuDe.trim()
    ? null
    : getAutoTitlePreview(attributes, values.thuocTinhs);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-space-lg">
      <header>
        <p className="m-0 font-caption-bold text-caption-bold uppercase tracking-wide text-primary">Bước 3 / 3</p>
        <h1 className="mb-space-2xs mt-space-xs font-headline-1 text-headline-1 text-on-surface">Thông tin chi tiết</h1>
      </header>

      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <label htmlFor="post-title" className="mb-space-xs block font-headline-3 text-headline-3 text-on-surface">
          Tiêu đề {!canAutoGenerateTitle && <span className="text-error">*</span>}
        </label>
        <input
          id="post-title"
          value={values.tieuDe}
          maxLength={MAX_TIEU_DE}
          required={!canAutoGenerateTitle}
          onChange={(event) => onChange({ tieuDe: event.target.value })}
          placeholder={canAutoGenerateTitle
            ? "Để trống để hệ thống tự tạo tiêu đề"
            : "Ví dụ: Laptop Dell Inspiron 15, i5, RAM 8GB"}
          className="h-11 w-full rounded-xl border-0 bg-surface-container-low px-space-md font-body-2 text-body-2 text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_#ff7a00]"
        />
        {titlePreview && (
          <p className="mb-0 mt-space-xs font-caption text-caption text-on-surface-variant" role="status">
            Tiêu đề sẽ được tạo: {titlePreview}
          </p>
        )}
        <span className="mt-space-xs block text-right font-caption text-caption text-on-surface-variant">
          {values.tieuDe.length}/{MAX_TIEU_DE}
        </span>
        {errors.tieuDe && <p className="mb-0 mt-space-xs font-caption text-caption text-error" role="alert">{errors.tieuDe}</p>}
      </section>

      {attributes.map((attribute) => {
        const parentValue = attribute.idThuocTinhCha ? values.thuocTinhs[attribute.idThuocTinhCha] : undefined;
        const choices = attribute.idThuocTinhCha
          ? attribute.danhSachLuaChon.filter((option) => String(option.idGiaTriCha) === String(parentValue))
          : attribute.danhSachLuaChon;
        const dependent = Boolean(attribute.idThuocTinhCha);
        const parentAttribute = dependent
          ? attributes.find((item) => item.id === attribute.idThuocTinhCha)
          : undefined;
        const dependencyHint = !parentValue
          ? `Chọn ${parentAttribute?.tenThuocTinh?.toLowerCase() ?? "thuộc tính cha"} trước`
          : `Chưa có dữ liệu ${attribute.tenThuocTinh}`;
        const fieldError = errors[`thuocTinhs.${attribute.id}`] ?? "";
        return (
          <section key={attribute.id} className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            {dependent && (!parentValue || choices.length === 0) ? (
              attribute.kieuDuLieu === "So" ? (
                <TextInput
                  id={`attribute-${attribute.id}`}
                  label={attribute.tenThuocTinh}
                  required={attribute.batBuoc}
                  type="number"
                  value={values.thuocTinhs[attribute.id] ?? ""}
                  disabled
                  hint={dependencyHint}
                />
              ) : (
                <SelectInput
                  id={`attribute-${attribute.id}`}
                  label={attribute.tenThuocTinh}
                  required={attribute.batBuoc}
                  value=""
                  disabled
                  hint={dependencyHint}
                >
                  <option value="">{dependencyHint}</option>
                </SelectInput>
              )
            ) : attribute.kieuDuLieu === "So" ? (
              <TextInput
                id={`attribute-${attribute.id}`}
                label={attribute.tenThuocTinh}
                required={attribute.batBuoc}
                type="number"
                value={values.thuocTinhs[attribute.id] ?? ""}
                onChange={(event) => setAttribute(attribute, event.target.value)}
              />
            ) : choices.length <= 3 ? (
              <Field id={`attribute-${attribute.id}`} label={attribute.tenThuocTinh} required={attribute.batBuoc}>
                <div className="flex flex-wrap gap-space-sm" role="group" aria-label={attribute.tenThuocTinh}>
                  {choices.map((option) => (
                    <button
                      type="button"
                      key={option.giaTri}
                      aria-pressed={values.thuocTinhs[attribute.id] === option.giaTri}
                      onClick={() => setAttribute(attribute, option.giaTri)}
                      className={`rounded-lg border px-space-md py-space-sm font-button-text text-button-text ${
                        values.thuocTinhs[attribute.id] === option.giaTri
                          ? "border-primary bg-primary-fixed text-on-primary-fixed"
                          : "border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary"
                      }`}
                    >
                      {option.ten}
                    </button>
                  ))}
                </div>
              </Field>
            ) : (
              <SelectInput
                id={`attribute-${attribute.id}`}
                label={attribute.tenThuocTinh}
                required={attribute.batBuoc}
                value={values.thuocTinhs[attribute.id] ?? ""}
                onChange={(event) => setAttribute(attribute, event.target.value)}
              >
                <option value="">Chọn {attribute.tenThuocTinh.toLowerCase()}</option>
                {choices.map((option) => <option key={option.giaTri} value={option.giaTri}>{option.ten}</option>)}
              </SelectInput>
            )}
            {fieldError && <p className="mb-0 mt-space-xs font-caption text-caption text-error" role="alert">{fieldError}</p>}
          </section>
        );
      })}

      <section className="flex flex-col gap-space-lg rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <h2 className="m-0 font-headline-3 text-headline-3 text-on-surface">Giá bán</h2>
        <PriceInput
          id="post-price"
          value={values.gia}
          required
          error={errors.gia}
          onChange={(gia) => onChange({ gia })}
        />
        <div className="flex flex-wrap gap-space-sm">
          <button type="button" aria-pressed={values.coThuongLuong} onClick={() => onChange({ coThuongLuong: !values.coThuongLuong })} className={`inline-flex items-center gap-space-xs rounded-lg border px-space-md py-space-sm font-button-text text-button-text ${values.coThuongLuong ? "border-primary bg-primary-fixed text-on-primary-fixed" : "border-outline-variant text-on-surface"}`}>
            <MaterialIcon name={values.coThuongLuong ? "check_circle" : "radio_button_unchecked"} size={18} /> Có thương lượng
          </button>
          <button type="button" aria-pressed={values.giaChotNhanh} onClick={() => onChange({ giaChotNhanh: !values.giaChotNhanh })} className={`inline-flex items-center gap-space-xs rounded-lg border px-space-md py-space-sm font-button-text text-button-text ${values.giaChotNhanh ? "border-primary bg-primary-fixed text-on-primary-fixed" : "border-outline-variant text-on-surface"}`}>
            <MaterialIcon name={values.giaChotNhanh ? "check_circle" : "radio_button_unchecked"} size={18} /> Giá chốt bán nhanh
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-space-lg rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <h2 className="m-0 font-headline-3 text-headline-3 text-on-surface">Địa chỉ & liên hệ</h2>
        <AddressFields
          required
          idThanhPho={values.idThanhPho}
          idPhuongXa={values.idPhuongXa}
          diaChiChiTiet={values.diaChiChiTiet}
          onChange={onChange}
        />
        {errors.idThanhPho && <p className="m-0 font-caption text-caption text-error" role="alert">{errors.idThanhPho}</p>}
        {errors.diaChiChiTiet && <p className="m-0 font-caption text-caption text-error" role="alert">{errors.diaChiChiTiet}</p>}
        <TextInput
          id="contact-phone"
          label="Số điện thoại liên hệ"
          type="tel"
          autoComplete="tel"
          value={values.soDienThoaiLienHe}
          onChange={(event) => onChange({ soDienThoaiLienHe: event.target.value })}
          hint={profileError ? `Chưa tải được số điện thoại hồ sơ: ${profileError}` : undefined}
        />
        {errors.soDienThoaiLienHe && <p className="m-0 font-caption text-caption text-error" role="alert">{errors.soDienThoaiLienHe}</p>}
        <label className="flex items-center gap-space-sm font-body-2 text-body-2 text-on-surface">
          <input type="checkbox" checked={values.choPhepChat} onChange={(event) => onChange({ choPhepChat: event.target.checked })} className="h-4 w-4 accent-primary" />
          Cho phép nhắn tin qua Chat
        </label>
      </section>

      {!hideFooter && (
        <div className="flex justify-between gap-space-sm">
          <button type="button" onClick={onBack} disabled={busy} className="h-11 rounded-xl border border-outline-variant px-space-lg font-button-text text-button-text text-on-surface hover:bg-surface-container-low disabled:opacity-50">Quay về</button>
          <button type="button" onClick={onSubmit} disabled={busy || submitDisabled} className="inline-flex h-11 items-center gap-space-xs rounded-xl bg-primary-container px-space-xl font-button-text text-button-text text-on-primary disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? "Đang đăng…" : "Đăng tin ngay"}
            {!busy && <MaterialIcon name="send" size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}
