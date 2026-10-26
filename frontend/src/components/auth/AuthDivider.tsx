interface Props {
  text: string;
}

/** Đường kẻ ngang có chữ ở giữa, ví dụ "Hoặc tiếp tục với". */
export default function AuthDivider({ text }: Props) {
  return (
    <div className="flex items-center gap-space-md">
      <span aria-hidden="true" className="h-px flex-1 bg-surface-variant" />
      <span className="font-caption-bold text-caption-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">{text}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-surface-variant" />
    </div>
  );
}
