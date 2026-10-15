import client from "./client";
import type { HoiThoai, PagedResult, TinNhan } from "../types";

export const tinNhanApi = {
  hoiThoai: () => client.get<HoiThoai[]>("/tin-nhan/hoi-thoai").then((r) => r.data),
  /** page 1 = tin mới nhất; mỗi trang BE trả theo thứ tự thời gian tăng dần. */
  tinNhan: (idHoiThoai: number, page = 1, pageSize = 30) =>
    client
      .get<PagedResult<TinNhan>>(`/tin-nhan/hoi-thoai/${idHoiThoai}`, { params: { page, pageSize } })
      .then((r) => r.data),
  gui: (idNguoiNhan: number, noiDung: string) =>
    client.post<TinNhan>("/tin-nhan", { idNguoiNhan, noiDung }).then((r) => r.data),
};
