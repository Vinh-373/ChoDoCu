import axios from "axios";
import { WrongBackendError } from "../api/client";

/**
 * Đọc thông báo lỗi từ BE. ExceptionHandlingMiddleware trả { status, message, errors },
 * còn AuthController trả { message }.
 */
export function getErrorMessage(err: unknown, fallback = "Có lỗi xảy ra, vui lòng thử lại."): string {
  if (err instanceof WrongBackendError) return err.message;
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Không kết nối được máy chủ. Hãy kiểm tra BE đã chạy và địa chỉ trong file .env.";
    const data = err.response.data as { message?: string; errors?: Record<string, string[]> | null } | undefined;
    if (data?.errors) {
      const all = Object.values(data.errors).flat();
      if (all.length) return all.join(" ");
    }
    if (data?.message) return data.message;
    if (err.response.status === 401) return "Bạn cần đăng nhập để thực hiện thao tác này.";
    if (err.response.status === 403) return "Tài khoản của bạn không có quyền thực hiện thao tác này.";
    if (err.response.status === 404) return "Không tìm thấy dữ liệu.";
  }
  return fallback;
}
