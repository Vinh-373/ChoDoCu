import client from "./client";
import type { DanhMuc, DanhMucThuocTinh } from "../types";

export const danhMucApi = {
  layCay: () => client.get<DanhMuc[]>("/danh-muc").then((r) => r.data),
  layThuocTinh: (id: number) =>
    client.get<DanhMucThuocTinh[]>(`/danh-muc/${id}/thuoc-tinh`).then((r) => r.data),
  cay: () => client.get<DanhMuc[]>("/danh-muc").then((r) => r.data),
  tao: (data: { idDanhMucCha: number | null; tenDanhMuc: string; anhDanhMuc?: string | null }) =>
    client.post<DanhMuc>("/danh-muc", data).then((r) => r.data),
  capNhat: (id: number, data: { tenDanhMuc: string; anhDanhMuc?: string | null; trangThai: string }) =>
    client.put<DanhMuc>(`/danh-muc/${id}`, data).then((r) => r.data),
  xoa: (id: number) => client.delete(`/danh-muc/${id}`).then(() => undefined),
};
