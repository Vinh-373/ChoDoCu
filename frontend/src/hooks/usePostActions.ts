import { useCallback, useState } from "react";
import { baiDangApi } from "../api/baiDang";
import { useToast } from "../contexts/ToastContext";
import { getErrorMessage } from "../utils/error";

export type PostAction = "an" | "hien" | "daBan" | "huyDang" | "xoa" | "dayTin" | "giaHan";

interface Options {
  onSuccess?: (action: PostAction) => void;
}

const SUCCESS_MESSAGES: Record<PostAction, string> = {
  an: "Đã ẩn tin.",
  hien: "Đã hiện tin.",
  daBan: "Đã đánh dấu tin đã bán.",
  huyDang: "Đã hủy đăng tin.",
  xoa: "Đã xóa tin.",
  dayTin: "Đã đẩy tin.",
  giaHan: "Đã gia hạn tin thêm 30 ngày.",
};

export default function usePostActions({ onSuccess }: Options = {}) {
  const toast = useToast();
  const [busyIds, setBusyIds] = useState<Set<number>>(() => new Set());

  const perform = useCallback(async (action: PostAction, id: number) => {
    if (busyIds.has(id)) return;
    setBusyIds((current) => new Set(current).add(id));
    try {
      await baiDangApi[action](id);
      toast(SUCCESS_MESSAGES[action], "ok");
      onSuccess?.(action);
      return true;
    } catch (error) {
      const message = getErrorMessage(error, "Chưa thực hiện được. Vui lòng thử lại.");
      const quotaAction = action === "dayTin" || action === "giaHan";
      const quotaMessage = /hết lượt|không còn lượt|lượt đăng|hết số lượt/i.test(message);
      toast(message, "error", quotaAction && quotaMessage ? { label: "Xem dịch vụ", to: "/dich-vu" } : undefined);
      return false;
    } finally {
      setBusyIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }, [busyIds, onSuccess, toast]);

  return { busyIds, perform };
}
