import client from "./client";
import type { Banner } from "../types";

export const bannerApi = {
  danhSach: (viTri?: string) => client.get<Banner[]>("/banner", { params: { viTri } }).then((r) => r.data),
  tao: (data: { hinhAnh: string; viTri?: string | null }) => client.post<Banner>("/banner", data).then((r) => r.data),
  xoa: (id: number) => client.delete(`/banner/${id}`).then(() => undefined),
};
