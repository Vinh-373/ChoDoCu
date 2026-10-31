import client from "./client";
import type { CapNhatHoSoRequest, HoSoNguoiDung } from "../types";

export const nguoiDungApi = {
  layHoSo: () => client.get<HoSoNguoiDung>("/nguoi-dung/me").then((r) => r.data),
  capNhatHoSo: (data: CapNhatHoSoRequest) => client.put<HoSoNguoiDung>("/nguoi-dung/me", data).then((r) => r.data),
  /** Bước 1 đổi số điện thoại: BE gửi mã 6 chữ số tới email tài khoản. */
  yeuCauDoiSoDienThoai: (soDienThoaiMoi: string) =>
    client.post<{ message: string }>("/nguoi-dung/me/doi-so-dien-thoai/yeu-cau", { soDienThoaiMoi }).then((r) => r.data),
  /** Bước 2: nhập mã nhận qua email; trả về hồ sơ đã cập nhật. */
  xacNhanDoiSoDienThoai: (soDienThoaiMoi: string, maXacNhan: string) =>
    client.post<HoSoNguoiDung>("/nguoi-dung/me/doi-so-dien-thoai/xac-nhan", { soDienThoaiMoi, maXacNhan }).then((r) => r.data),
};
