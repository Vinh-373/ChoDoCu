import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/auth";
import { AUTH_EXPIRED_EVENT, TOKEN_KEY, USER_KEY } from "../api/client";
import type { AuthResponse, DangKyRequest, DangNhapRequest } from "../types";
import { useToast } from "./ToastContext";

interface AuthContextValue {
  user: AuthResponse | null;
  isStaff: boolean; // Admin hoặc Moderator
  isAdmin: boolean;
  login: (data: DangNhapRequest) => Promise<void>;
  register: (data: DangKyRequest) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw && localStorage.getItem(TOKEN_KEY) ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [user, setUser] = useState<AuthResponse | null>(readStoredUser);

  const save = useCallback((data: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    setUser(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const login = useCallback(async (data: DangNhapRequest) => save(await authApi.dangNhap(data)), [save]);
  const register = useCallback(async (data: DangKyRequest) => save(await authApi.dangKy(data)), [save]);

  // Token hết hạn: interceptor phát sự kiện, ở đây đăng xuất và báo cho người dùng.
  useEffect(() => {
    const onExpired = () => {
      logout();
      toast("Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.", "info");
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [logout, toast]);

  const value = useMemo<AuthContextValue>(() => {
    const role = user?.role ?? "";
    return {
      user,
      isAdmin: role === "Admin",
      isStaff: role === "Admin" || role === "Moderator",
      login,
      register,
      logout,
      hasRole: (...roles: string[]) => roles.includes(role),
    };
  }, [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải nằm trong AuthProvider");
  return ctx;
}
