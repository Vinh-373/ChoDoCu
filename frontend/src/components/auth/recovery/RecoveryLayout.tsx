import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import MaterialIcon from "../../common/MaterialIcon";
import RecoveryAssurances from "./RecoveryAssurances";
import RecoverySteps, { RECOVERY_STEPS } from "./RecoverySteps";

interface Props {
  step: number;
  children: ReactNode;
}

/** Khung trang khôi phục: huy hiệu bảo mật, thẻ hai cột (các bước | form), thanh trợ giúp, ba thẻ cam kết. */
export default function RecoveryLayout({ step, children }: Props) {
  return (
    <div className="w-full max-w-7xl mx-auto px-margin-desktop py-space-xl lg:py-space-3xl">
      <div className="flex justify-end mb-space-xl">
        <div className="inline-flex items-center gap-space-2xs px-space-md py-space-xs bg-surface-container-low rounded-full">
          <MaterialIcon name="verified_user" size={15} className="text-secondary" />
          <span className="font-caption-bold text-caption-bold text-on-surface">Kênh hỗ trợ xác thực có mã hóa</span>
        </div>
      </div>

      <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        <RecoverySteps step={step} />

        <section className="lg:col-span-7 p-space-xl sm:p-space-2xl lg:p-space-3xl flex flex-col justify-between bg-surface-container-lowest">
          <div className="flex items-center justify-between mb-space-2xl">
            <Link
              to="/dang-nhap"
              className="group inline-flex items-center gap-space-xs text-on-surface-variant hover:text-primary no-underline hover:no-underline transition-colors font-button-text text-button-text"
            >
              <MaterialIcon name="arrow_back" size={20} className="transition-transform group-hover:-translate-x-1" />
              <span>Quay lại đăng nhập</span>
            </Link>
            <span className="font-caption-bold text-caption-bold px-space-md py-space-xs rounded-full bg-surface-container-low text-primary">
              Bước {step} / {RECOVERY_STEPS.length}
            </span>
          </div>

          <div className="max-w-md w-full mx-auto flex flex-col items-center text-center">{children}</div>

          <div className="mt-space-2xl bg-surface-container-low/50 rounded-xl p-space-md text-center flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <MaterialIcon name="help" size={20} className="text-secondary" />
              <span className="font-caption text-caption text-left">Gặp trở ngại kỹ thuật hoặc không nhận được mã?</span>
            </div>
            <div className="flex items-center gap-space-md">
              <span className="font-caption-bold text-caption-bold text-primary flex items-center gap-space-2xs">
                <MaterialIcon name="call" size={16} />
                <span>Tổng đài 1900 6868</span>
              </span>
              <span aria-hidden="true" className="text-on-surface-variant text-caption">|</span>
              <Link to="/tin-nhan" className="font-caption-bold text-caption-bold text-secondary hover:underline flex items-center gap-space-2xs">
                <MaterialIcon name="chat" size={16} />
                <span>Chat hỗ trợ</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <RecoveryAssurances />
    </div>
  );
}
