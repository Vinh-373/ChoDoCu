import { useState } from "react";
import { Navigate } from "react-router-dom";
import DoneStep from "../../components/auth/recovery/DoneStep";
import EmailStep from "../../components/auth/recovery/EmailStep";
import NewPasswordStep from "../../components/auth/recovery/NewPasswordStep";
import OtpStep from "../../components/auth/recovery/OtpStep";
import RecoveryLayout from "../../components/auth/recovery/RecoveryLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

type Step = 1 | 2 | 3 | 4;

/** Khôi phục mật khẩu 4 bước: email → mã 6 số → mật khẩu mới → hoàn tất. Mỗi bước là một component ở components/auth/recovery. */
export default function ForgotPasswordPage() {
  useDocumentTitle("Khôi phục mật khẩu");
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  if (user) return <Navigate to="/" replace />;

  return (
    <RecoveryLayout step={step}>
      {step === 1 && (
        <EmailStep
          initialEmail={email}
          onSent={(value) => {
            setEmail(value);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <OtpStep
          email={email}
          onVerified={(value) => {
            setCode(value);
            setStep(3);
          }}
          onChangeEmail={() => setStep(1)}
        />
      )}
      {step === 3 && <NewPasswordStep email={email} code={code} onDone={() => setStep(4)} />}
      {step === 4 && <DoneStep />}
    </RecoveryLayout>
  );
}
