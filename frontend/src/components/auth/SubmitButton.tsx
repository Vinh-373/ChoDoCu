import MaterialIcon from "../common/MaterialIcon";

interface Props {
  busy: boolean;
  label: string;
  busyLabel: string;
}

export default function SubmitButton({ busy, label, busyLabel }: Props) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="group w-full h-12 mt-space-2xs bg-primary-container hover:bg-primary text-on-primary font-button-text text-button-text rounded-xl border-0 cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-space-xs disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {busy ? (
        <>
          <MaterialIcon name="progress_activity" size={20} className="animate-spin" />
          <span>{busyLabel}</span>
        </>
      ) : (
        <>
          <span className="tracking-wide">{label}</span>
          <MaterialIcon name="arrow_forward" size={20} className="transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}
