import { Link } from "react-router-dom";
import MaterialIcon from "../../common/MaterialIcon";
import RecoveryHeading from "./RecoveryHeading";

/** Bước 4: báo thành công, dẫn về trang đăng nhập. */
export default function DoneStep() {
  return (
    <>
      <RecoveryHeading icon="check_circle" title="Đã đặt lại mật khẩu" subtitle="Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ." />
      <Link
        to="/dang-nhap"
        className="group w-full h-12 bg-primary-container hover:bg-primary text-on-primary hover:no-underline no-underline font-button-text text-button-text rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-space-xs"
      >
        <span className="tracking-wide">Đăng nhập ngay</span>
        <MaterialIcon name="arrow_forward" size={20} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </>
  );
}
