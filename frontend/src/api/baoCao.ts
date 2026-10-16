import client from "./client";
import type { BaoCao, PagedResult } from "../types";

export const baoCaoApi = {
  tao: (data: { idBaiDang: number; noiDung: string }) => client.post<BaoCao>("/bao-cao", data).then((r) => r.data),
  danhSach: (trangThai: string | undefined, page = 1, pageSize = 20) =>
    client.get<PagedResult<BaoCao>>("/bao-cao", { params: { trangThai, page, pageSize } }).then((r) => r.data),
  xuLy: (id: number, trangThaiMoi: string) =>
    client.put(`/bao-cao/${id}/xu-ly`, null, { params: { trangThaiMoi } }).then(() => undefined),
};
