import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import MaterialIcon from "../common/MaterialIcon";

const shell =
  "relative flex items-center bg-surface-container-low rounded-xl transition-all focus-within:bg-surface-container-lowest focus-within:shadow-[0_0_0_2px_#ff7a00]";
const control =
  "w-full h-12 pl-11 bg-transparent border-0 rounded-xl font-body-2 text-body-2 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:shadow-none";

interface ShellProps {
  id: string;
  label: string;
  icon: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

/** Nhãn + khung có icon bên trái. Dùng chung cho ô nhập và ô chọn. */
function FieldShell({ id, label, icon, required, hint, children }: ShellProps) {
  return (
    <div className="flex flex-col gap-space-2xs">
      <label htmlFor={id} className="font-caption-bold text-caption-bold text-on-surface">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className={shell}>
        <MaterialIcon name={icon} size={20} className="absolute left-space-md text-on-surface-variant pointer-events-none" />
        {children}
      </div>
      {hint && <span className="font-caption text-caption text-on-surface-variant">{hint}</span>}
    </div>
  );
}

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & Omit<ShellProps, "children"> & { id: string };

/** Ô nhập có icon. type="password" tự có nút hiện/ẩn mật khẩu. */
export function AuthField({ id, label, icon, hint, type = "text", required, ...rest }: FieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <FieldShell id={id} label={label} icon={icon} hint={hint} required={required}>
      <input id={id} type={isPassword && visible ? "text" : type} required={required} className={`${control} ${isPassword ? "pr-11" : "pr-space-md"}`} {...rest} />
      {isPassword && (
        <button
          type="button"
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-space-md p-space-2xs bg-transparent border-0 cursor-pointer flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <MaterialIcon name={visible ? "visibility" : "visibility_off"} size={20} />
        </button>
      )}
    </FieldShell>
  );
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "className"> & Omit<ShellProps, "children"> & { id: string };

export function AuthSelect({ id, label, icon, hint, required, children, ...rest }: SelectProps) {
  return (
    <FieldShell id={id} label={label} icon={icon} hint={hint} required={required}>
      <select id={id} required={required} className={`${control} pr-11 appearance-none cursor-pointer`} {...rest}>
        {children}
      </select>
      <MaterialIcon name="expand_more" size={20} className="absolute right-space-md text-on-surface-variant pointer-events-none" />
    </FieldShell>
  );
}
