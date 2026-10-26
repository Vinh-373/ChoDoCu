import type { ReactNode } from "react";
import { useToast } from "../../contexts/ToastContext";

// Logo thương hiệu là SVG (Material Symbols không có icon Google/Facebook).
function GoogleLogo() {
  return (
    <svg className="block w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  );
}

function FacebookLogo() {
  return (
    <svg className="block w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

interface ButtonProps {
  label: string;
  logo: ReactNode;
  onClick: () => void;
}

function SocialButton({ label, logo, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 w-full px-space-md bg-white hover:bg-surface-container-low text-on-surface border border-outline-variant rounded-xl flex items-center justify-center gap-space-sm cursor-pointer shadow-sm transition-colors font-button-text text-body-2"
    >
      {logo}
      <span className="leading-none">{label}</span>
    </button>
  );
}

/** Hai nút đăng nhập mạng xã hội. BE chưa có OAuth nên hiện mới chỉ báo "chưa hỗ trợ". */
export default function SocialLoginButtons() {
  const toast = useToast();
  const notSupported = (name: string) => () => toast(`Đăng nhập bằng ${name} chưa được hỗ trợ.`, "info");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
      <SocialButton label="Google" logo={<GoogleLogo />} onClick={notSupported("Google")} />
      <SocialButton label="Facebook" logo={<FacebookLogo />} onClick={notSupported("Facebook")} />
    </div>
  );
}
