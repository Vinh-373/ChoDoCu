import MaterialIcon from "../../common/MaterialIcon";

interface Props {
  icon: string;
  title: string;
  subtitle: string;
}

/** Biểu tượng tròn + tiêu đề + mô tả, căn giữa, dùng chung cho cả 4 bước. */
export default function RecoveryHeading({ icon, title, subtitle }: Props) {
  return (
    <>
      <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center mb-space-lg shadow-sm">
        <MaterialIcon name={icon} size={40} filled className="text-primary" />
      </div>
      <h1 className="m-0 font-headline-1 text-headline-1 text-on-surface font-bold tracking-tight mb-space-xs">{title}</h1>
      <p className="m-0 font-body-2 text-body-2 text-on-surface-variant max-w-sm mb-space-2xl">{subtitle}</p>
    </>
  );
}
