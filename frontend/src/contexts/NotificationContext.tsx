import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { thongBaoApi } from "../api/thongBao";
import { useAuth } from "./AuthContext";

interface NotificationValue {
  unread: number;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationValue | null>(null);

/** Đếm thông báo chưa đọc, tự làm mới mỗi 60 giây khi đã đăng nhập. */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const userId = user?.idNguoiDung;

  const refresh = useCallback(async () => {
    if (!userId) return setUnread(0);
    try {
      setUnread(await thongBaoApi.demChuaDoc());
    } catch {
      /* bỏ qua lỗi tạm thời */
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
    if (!userId) return;
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(timer);
  }, [userId, refresh]);

  const value = useMemo(() => ({ unread, refresh }), [unread, refresh]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications phải nằm trong NotificationProvider");
  return ctx;
}
