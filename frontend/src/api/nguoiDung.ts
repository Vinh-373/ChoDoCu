import client from "./client";
import type { CapNhatHoSoRequest, HoSoNguoiDung } from "../types";

export const nguoiDungApi = {
  layHoSo: () => client.get<HoSoNguoiDung>("/nguoi-dung/me").then((r) => r.data),
  capNhatHoSo: (data: CapNhatHoSoRequest) => client.put<HoSoNguoiDung>("/nguoi-dung/me", data).then((r) => r.data),
};
