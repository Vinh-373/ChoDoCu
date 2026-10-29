import MaterialIcon from "../common/MaterialIcon";

interface Props {
  icon: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

export default function AuthFormHeader({ icon, eyebrow, title, subtitle }: Props) {
  return (
    <div className="flex flex-col gap-space-2xs">
      <div className="flex items-center gap-space-2xs text-primary-container">
        <MaterialIcon name={icon} size={22} />
        <span className="font-caption-bold text-caption-bold tracking-wider uppercase">{eyebrow}</span>
      </div>
      <h1 className="m-0 font-headline-1 text-[28px] sm:text-[32px] leading-tight font-bold text-on-surface">{title}</h1>
      <p className="m-0 font-body-1 text-body-1 text-on-surface-variant">{subtitle}</p>
    </div>
  );
}
