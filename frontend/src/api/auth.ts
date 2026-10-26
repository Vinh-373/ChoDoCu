import client from "./client";
import type { AuthResponse, DangKyRequest, DangNhapRequest, DoiMatKhauRequest } from "../types";

export const authApi = {
  dangNhap: (data: DangNhapRequest) => client.post<AuthResponse>("/auth/dang-nhap", data).then((r) => r.data),
  dangKy: (data: DangKyRequest) => client.post<AuthResponse>("/auth/dang-ky", data).then((r) => r.data),

  /** Đổi mật khẩu khi đã đăng nhập (BE: AuthService.DoiMatKhauAsync). */
  doiMatKhau: (data: DoiMatKhauRequest) => client.put("/auth/doi-mat-khau", data).then(() => undefined),

  // ---- Khôi phục mật khẩu: gửi liên kết qua email, rồi đặt mật khẩu mới bằng token trong liên kết ----
  /** Bước 1: BE gửi email chứa liên kết đặt lại mật khẩu. BE luôn trả 200 để không lộ email nào đã đăng ký. */
  quenMatKhau: (email: string) => client.post("/auth/quen-mat-khau", { email }).then(() => undefined),
  /** Bước 3: đặt mật khẩu mới bằng token lấy từ liên kết trong email (token của ASP.NET Identity). */
  datLaiMatKhau: (data: { email: string; token: string; matKhauMoi: string }) =>
    client.post("/auth/dat-lai-mat-khau", data).then(() => undefined),
};
