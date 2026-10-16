import { Link } from "react-router-dom";
import MaterialIcon from "../common/MaterialIcon";

interface Props {
  text: string;
  linkText: string;
  to: string;
}

/** Dòng chuyển qua lại giữa đăng nhập và đăng ký. */
export default function AuthSwitchPrompt({ text, linkText, to }: Props) {
  return (
    <p className="m-0 text-center pt-space-xs font-body-2 text-body-2 text-on-surface-variant">
      {text}{" "}
      <Link to={to} className="ml-1 inline-flex items-center gap-0.5 font-button-text text-primary hover:underline">
        <span>{linkText}</span>
        <MaterialIcon name="chevron_right" size={16} />
      </Link>
    </p>
  );
}
