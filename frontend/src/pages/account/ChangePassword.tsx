import { useState } from "react";
import PasswordByEmail from "../../components/account/PasswordByEmail";
import PasswordByOldForm from "../../components/account/PasswordByOldForm";
import { Card } from "../../components/account/FormControls";
import MaterialIcon from "../../components/common/MaterialIcon";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

type Method = "old" | "email";

const TABS: { key: Method; label: string; icon: string }[] = [
  { key: "old", label: "Dùng mật khẩu hiện tại", icon: "lock" },
  { key: "email", label: "Nhận mã qua email", icon: "mail" },
];

/** Đổi mật khẩu khi đã đăng nhập (/doi-mat-khau): 2 cách. */
export default function ChangePassword() {
  useDocumentTitle("Đổi mật khẩu");
  const [method, setMethod] = useState<Method>("old");

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-space-lg pb-space-xl">
      <Card className="p-space-xl">
        <h1 className="m-0 font-headline-1 text-headline-1 text-on-surface">Đổi mật khẩu tài khoản</h1>
        <p className="m-0 mt-space-2xs font-body-2 text-body-2 text-on-surface-variant">
          Để bảo vệ tài khoản Chợ Đồ Cũ của bạn, vui lòng không chia sẻ mật khẩu cho bất kỳ ai.
        </p>
        <div role="tablist" aria-label="Cách đổi mật khẩu" className="mt-space-lg grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          {TABS.map((t) => {
            const active = method === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMethod(t.key)}
                className={`h-12 rounded-xl border-0 cursor-pointer inline-flex items-center justify-center gap-space-xs font-button-text text-button-text transition-colors ${
                  active ? "bg-primary-container text-on-primary" : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <MaterialIcon name={t.icon} size={18} />
                {t.label}
              </button>
            );
          })}
        </div>
      </Card>

      {method === "old" ? <PasswordByOldForm /> : <PasswordByEmail />}
    </div>
  );
}
