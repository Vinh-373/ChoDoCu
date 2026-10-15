import client from "./client";
import type { LichSuTimKiem } from "../types";

export const timKiemApi = {
  lichSu: (soLuong = 8) =>
    client.get<LichSuTimKiem[]>("/tim-kiem/lich-su", { params: { soLuong } }).then((r) => r.data),
};
