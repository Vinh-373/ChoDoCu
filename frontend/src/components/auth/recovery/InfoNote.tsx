import type { ReactNode } from "react";
import MaterialIcon from "../../common/MaterialIcon";

export default function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-space-xs p-space-sm bg-surface-container-low rounded-lg text-on-surface-variant">
      <MaterialIcon name="info" size={18} className="text-primary-container mt-0.5" />
      <p className="m-0 font-caption text-caption leading-tight">{children}</p>
    </div>
  );
}
