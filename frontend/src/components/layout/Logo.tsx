import { Link } from "react-router-dom";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#ff7a00" />
      <path d="M14 32 26 16h26v32H26z" fill="#ffffff" />
      <circle cx="26" cy="32" r="3.6" fill="#ff7a00" />
    </svg>
  );
}

export default function Logo() {
  return (
    <Link
      to="/"
      aria-label="Chợ Đồ Cũ – trang chủ"
      className="flex items-center gap-space-sm shrink-0 no-underline hover:no-underline"
    >
      <LogoMark className="h-11 w-11" />
      <span className="flex flex-col">
        <span className="font-headline-2 text-headline-2 text-primary font-bold tracking-tight leading-none">Chợ Đồ Cũ</span>
        <span className="hidden sm:block font-caption text-caption text-on-surface-variant leading-tight">Mua bán tin cậy, tiện lợi</span>
      </span>
    </Link>
  );
}
