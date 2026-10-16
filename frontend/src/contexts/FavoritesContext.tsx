import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { yeuThichApi } from "../api/yeuThich";
import { getErrorMessage } from "../utils/error";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface FavoritesValue {
  has: (idBaiDang: number) => boolean;
  toggle: (idBaiDang: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

/**
 * BE chưa có API "bài này đã thích chưa", nên khi đăng nhập ta nạp toàn bộ danh sách yêu thích (50 tin/lần)
 * vào một Set để biết nút tim nào cần tô đậm.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const [ids, setIds] = useState<Set<number>>(new Set());

  const userId = user?.idNguoiDung;
  useEffect(() => {
    if (!userId) {
      setIds(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const all = new Set<number>();
        let page = 1;
        let totalPages = 1;
        do {
          const res = await yeuThichApi.danhSach(page, 50);
          res.items.forEach((x) => all.add(x.idBaiDang));
          totalPages = res.totalPages;
          page++;
        } while (page <= totalPages && page <= 20);
        if (!cancelled) setIds(all);
      } catch {
        /* không chặn giao diện nếu nạp yêu thích thất bại */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggle = useCallback(
    async (idBaiDang: number) => {
      if (!userId) {
        toast("Đăng nhập để lưu tin yêu thích.", "info");
        return;
      }
      try {
        const daThich = await yeuThichApi.toggle(idBaiDang);
        setIds((cur) => {
          const next = new Set(cur);
          if (daThich) next.add(idBaiDang);
          else next.delete(idBaiDang);
          return next;
        });
        toast(daThich ? "Đã lưu vào yêu thích." : "Đã bỏ khỏi yêu thích.", "ok");
      } catch (e) {
        toast(getErrorMessage(e), "error");
      }
    },
    [userId, toast],
  );

  const value = useMemo(() => ({ has: (id: number) => ids.has(id), toggle }), [ids, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites phải nằm trong FavoritesProvider");
  return ctx;
}
