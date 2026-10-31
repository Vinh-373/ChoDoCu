import client from "./client";
import type { AuthResponse, DangKyRequest, DangNhapRequest, DoiMatKhauRequest } from "../types";

export const authApi = {
  dangNhap: (data: DangNhapRequest) => client.post<AuthResponse>("/auth/dang-nhap", data).then((r) => r.data),
  dangKy: (data: DangKyRequest) => client.post<AuthResponse>("/auth/dang-ky", data).then((r) => r.data),

  /** Đăng nhập bằng Google: gửi idToken (JWT do Google ký) để BE xác minh rồi trả AuthResponse như đăng nhập thường. */
  dangNhapGoogle: (idToken: string) => client.post<AuthResponse>("/auth/dang-nhap-google", { idToken }).then((r) => r.data),
  /** Đổi mật khẩu khi đã đăng nhập (BE: AuthService.DoiMatKhauAsync). */
  doiMatKhau: (data: DoiMatKhauRequest) => client.post("/auth/doi-mat-khau", data).then(() => undefined),

  // ---- Khôi phục mật khẩu: gửi mã 6 số qua email, nhập mã rồi đặt mật khẩu mới ----
  /** Bước 1: BE gửi email chứa mã 6 số. BE luôn trả 200 để không lộ email nào đã đăng ký. */
  quenMatKhau: (email: string) => client.post("/auth/quen-mat-khau", { email }).then(() => undefined),
  /** Bước 2: kiểm tra mã 6 số nhận qua email (chưa đổi mật khẩu). */
  xacNhanMaDatLai: (email: string, maXacNhan: string) =>
    client.post("/auth/xac-nhan-ma-dat-lai", { email, maXacNhan }).then(() => undefined),
  /** Bước 3: đặt mật khẩu mới. BE đọc mã 6 số ở trường `token` của DatLaiMatKhauRequest. */
  datLaiMatKhau: (data: { email: string; maXacNhan: string; matKhauMoi: string }) =>
    client.post("/auth/dat-lai-mat-khau", { email: data.email, token: data.maXacNhan, matKhauMoi: data.matKhauMoi }).then(() => undefined),
};
