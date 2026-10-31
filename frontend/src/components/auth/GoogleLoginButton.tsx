import { useEffect, useRef, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

interface GoogleId {
  initialize: (config: { client_id: string; callback: (res: { credential?: string }) => void; ux_mode?: string }) => void;
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

let scriptPromise: Promise<void> | null = null;
/** Nạp Google Identity Services đúng một lần cho cả ứng dụng. */
function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Không tải được Google Identity Services."));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export const googleConfigured = Boolean(CLIENT_ID);

interface Props {
  onCredential: (idToken: string) => void;
  onError: (message: string) => void;
}

/**
 * Nút "Đăng nhập bằng Google" chính thức của Google (nền trắng, logo căn giữa).
 * Khi người dùng chọn tài khoản, Google trả về idToken để gửi cho BE xác minh.
 */
export default function GoogleLoginButton({ onCredential, onError }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  // Giữ callback mới nhất mà không phải khởi tạo lại Google mỗi lần render.
  const handlers = useRef({ onCredential, onError });
  handlers.current = { onCredential, onError };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setWidth(Math.min(400, Math.floor(el.getBoundingClientRect().width)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!CLIENT_ID || !el || width < 200) return; // Google yêu cầu nút rộng tối thiểu 200px
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (res) => {
            if (res.credential) handlers.current.onCredential(res.credential);
            else handlers.current.onError("Google không trả về thông tin đăng nhập.");
          },
        });
        el.innerHTML = "";
        window.google.accounts.id.renderButton(el, { type: "standard", theme: "outline", size: "large", text: "signin_with", shape: "rectangular", logo_alignment: "center", locale: "vi", width });
      })
      .catch((e: Error) => handlers.current.onError(e.message));
    return () => {
      cancelled = true;
    };
  }, [width]);

  return <div ref={box} className="w-full min-h-10 flex justify-center" aria-label="Đăng nhập bằng Google" />;
}
