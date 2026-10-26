import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import MaterialIcon from "../common/MaterialIcon";

const box =
  "w-full bg-surface-container-low rounded-xl border-0 font-body-2 text-body-2 text-on-surface placeholder:text-on-surface-variant/70 transition-all focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#ff7a00] read-only:cursor-not-allowed read-only:text-on-surface-variant";

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  /** Chữ nhỏ bên phải nhãn. */
  aside?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}

/** Nhãn + ô nhập + gợi ý, dùng chung cho các form trong trang tài khoản. */
export function Field({ id, label, required, aside, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-space-2xs min-w-0">
      <div className="flex items-baseline justify-between gap-space-sm">
        <label htmlFor={id} className="font-caption-bold text-caption-bold text-on-surface">
          {label} {required && <span className="text-error">*</span>}
        </label>
        {aside && <span className="font-caption text-caption text-on-surface-variant">{aside}</span>}
      </div>
      {children}
      {hint && <span className="font-caption text-caption text-on-surface-variant">{hint}</span>}
    </div>
  );
}

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & Omit<FieldProps, "children"> & { trailing?: ReactNode };

export function TextInput({ id, label, required, aside, hint, trailing, ...rest }: TextInputProps) {
  return (
    <Field id={id} label={label} required={required} aside={aside} hint={hint}>
      <div className="relative flex items-center">
        <input id={id} required={required} className={`${box} h-11 px-space-md ${trailing ? "pr-11" : ""}`} {...rest} />
        {trailing && <span className="absolute right-space-md flex items-center text-on-surface-variant">{trailing}</span>}
      </div>
    </Field>
  );
}

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & Omit<FieldProps, "children">;

export function TextArea({ id, label, required, aside, hint, ...rest }: TextAreaProps) {
  return (
    <Field id={id} label={label} required={required} aside={aside} hint={hint}>
      <textarea id={id} required={required} className={`${box} px-space-md py-space-sm resize-y min-h-24`} {...rest} />
    </Field>
  );
}

type SelectInputProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & Omit<FieldProps, "children">;

export function SelectInput({ id, label, required, aside, hint, children, ...rest }: SelectInputProps) {
  return (
    <Field id={id} label={label} required={required} aside={aside} hint={hint}>
      <div className="relative flex items-center">
        <select id={id} required={required} className={`${box} h-11 pl-space-md pr-10 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`} {...rest}>
          {children}
        </select>
        <MaterialIcon name="expand_more" size={20} className="absolute right-space-md text-on-surface-variant pointer-events-none" />
      </div>
    </Field>
  );
}

/** Ô mật khẩu có nút hiện/ẩn. */
export function PasswordInput({ id, label, required, aside, hint, ...rest }: Omit<TextInputProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);
  return (
    <Field id={id} label={label} required={required} aside={aside} hint={hint}>
      <div className="relative flex items-center">
        <input id={id} type={visible ? "text" : "password"} required={required} className={`${box} h-12 px-space-md pr-11`} {...rest} />
        <button
          type="button"
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-space-md p-space-2xs bg-transparent border-0 cursor-pointer flex items-center text-on-surface-variant hover:text-on-surface"
        >
          <MaterialIcon name={visible ? "visibility" : "visibility_off"} size={20} />
        </button>
      </div>
    </Field>
  );
}

/** Thẻ trắng bo góc chứa một nhóm nội dung. */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] ${className}`}>{children}</section>;
}

/** Tiêu đề nhóm có icon cam, ví dụ "1. Thông tin cá nhân". */
export function SectionTitle({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <h2 className="m-0 flex items-center gap-space-sm font-headline-3 text-headline-3 text-on-surface">
      <span className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
        <MaterialIcon name={icon} size={18} filled />
      </span>
      {children}
    </h2>
  );
}