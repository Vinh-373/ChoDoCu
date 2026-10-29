import MaterialIcon from "../../common/MaterialIcon";

const ITEMS = [
  { icon: "sms", tone: "bg-surface-container text-primary", title: "Xác thực OTP tức thời", text: "Gửi mã tự động qua email bảo mật của bạn" },
  { icon: "enhanced_encryption", tone: "bg-secondary-container/30 text-secondary", title: "Mã hóa đa tầng", text: "Bảo vệ thông tin định danh và lịch sử mua bán" },
  { icon: "verified", tone: "bg-primary-fixed text-primary-container", title: "Tự động kích hoạt lại", text: "Khôi phục quyền truy cập tin đăng ngay sau khi đổi mật khẩu" },
];

/** Ba thẻ cam kết dưới thẻ chính. */
export default function RecoveryAssurances() {
  return (
    <div className="mt-space-2xl grid grid-cols-1 md:grid-cols-3 gap-gutter-desktop">
      {ITEMS.map((it) => (
        <div key={it.title} className="p-space-lg bg-surface-container-lowest rounded-xl shadow-sm flex items-center gap-space-md">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${it.tone}`}>
            <MaterialIcon name={it.icon} size={26} />
          </div>
          <div className="flex flex-col">
            <h4 className="m-0 font-button-text text-button-text text-on-surface font-semibold">{it.title}</h4>
            <p className="m-0 font-caption text-caption text-on-surface-variant">{it.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
