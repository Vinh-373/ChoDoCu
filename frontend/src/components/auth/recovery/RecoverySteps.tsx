import MaterialIcon from "../../common/MaterialIcon";

export const RECOVERY_STEPS = [
  { title: "Nhập email", text: "Xác định tài khoản cần khôi phục" },
  { title: "Nhập mã OTP xác thực", text: "Nhận 6 chữ số qua email cá nhân" },
  { title: "Đặt mật khẩu mới", text: "Tạo mật khẩu mới, tối thiểu 6 ký tự" },
  { title: "Hoàn tất & đăng nhập", text: "Dùng mật khẩu mới để vào lại tài khoản" },
];

/** Cột trái: giới thiệu + thanh tiến trình 4 bước (bước hiện tại được làm nổi). */
export default function RecoverySteps({ step }: { step: number }) {
  return (
    <aside className="lg:col-span-5 hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary-container via-primary-container to-primary p-space-3xl text-on-primary relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-surface-container-lowest/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-12 w-64 h-64 bg-surface-container-lowest/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col">
        <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-lowest/20 backdrop-blur-md rounded-full self-start mb-space-xl">
          <MaterialIcon name="shield_locked" size={18} className="text-surface-container-lowest" />
          <span className="font-caption-bold text-caption-bold text-surface-container-lowest uppercase tracking-wider">Hệ thống bảo mật</span>
        </div>
        <h2 className="m-0 font-headline-1 text-headline-1 text-on-primary mb-space-sm font-bold tracking-tight">Bảo vệ tài khoản an toàn với Chợ Đồ Cũ</h2>
        <p className="m-0 font-body-2 text-body-2 text-on-primary/90 mb-space-2xl leading-relaxed">
          Quy trình khôi phục nhanh chóng, minh bạch nhằm đảm bảo quyền sở hữu tin đăng của bạn không bị gián đoạn.
        </p>

        <ol className="m-0 p-0 list-none flex flex-col gap-space-lg relative">
          <div aria-hidden="true" className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-surface-container-lowest/25 z-0" />
          {RECOVERY_STEPS.map((s, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <li
                key={s.title}
                aria-current={active ? "step" : undefined}
                className={`relative z-10 flex items-start gap-space-md rounded-xl transition-all ${
                  active ? "bg-surface-container-lowest/15 backdrop-blur-sm p-space-md shadow-sm" : "px-space-md py-space-xs opacity-75"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-headline-3 text-headline-3 font-bold ${
                    active ? "bg-surface-container-lowest text-primary-container shadow-md" : "bg-surface-container-lowest/20 text-surface-container-lowest"
                  }`}
                >
                  {done ? <MaterialIcon name="check" size={22} /> : n}
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="font-button-text text-button-text text-surface-container-lowest font-bold">{s.title}</span>
                  <span className="font-caption text-caption text-surface-container-lowest/80">{s.text}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="relative z-10 pt-space-2xl mt-space-2xl">
        <div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest/15 backdrop-blur-md rounded-xl">
          <MaterialIcon name="support_agent" size={32} className="text-surface-container-lowest" />
          <div className="flex flex-col">
            <span className="font-caption-bold text-caption-bold text-surface-container-lowest">Tổng đài hỗ trợ tài khoản 24/7</span>
            <span className="font-price-md text-price-md text-surface-container-lowest">1900 6868 (Miễn phí cước)</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
