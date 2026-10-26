import MaterialIcon from "../common/MaterialIcon";

/** Thông báo lỗi trên form (đọc ngay bằng trình đọc màn hình nhờ role="alert"). */
export default function FormAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-space-xs rounded-xl bg-error-container text-on-error-container px-space-md py-space-sm font-body-2 text-body-2">
      <MaterialIcon name="error" size={18} className="mt-px" />
      <span>{message}</span>
    </div>
  );
}
