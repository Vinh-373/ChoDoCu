import client from "./client";
import type { AuthResponse, DangKyRequest, DangNhapRequest } from "../types";

export const authApi = {
  dangNhap: (data: DangNhapRequest) => client.post<AuthResponse>("/auth/dang-nhap", data).then((r) => r.data),
  dangKy: (data: DangKyRequest) => client.post<AuthResponse>("/auth/dang-ky", data).then((r) => r.data),
};
