import client from "./client";
import type { PagedResult, ThongBao } from "../types";

export const thongBaoApi = {
  danhSach: (page = 1, pageSize = 20) =>
    client.get<PagedResult<ThongBao>>("/thong-bao", { params: { page, pageSize } }).then((r) => r.data),
  demChuaDoc: () => client.get<{ soLuong: number }>("/thong-bao/dem-chua-doc").then((r) => r.data.soLuong),
  daDoc: (id: number) => client.put(`/thong-bao/${id}/da-doc`).then(() => undefined),
};
