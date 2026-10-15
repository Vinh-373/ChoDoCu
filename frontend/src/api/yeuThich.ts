import client from "./client";
import type { PagedResult, YeuThich } from "../types";

export const yeuThichApi = {
  /** Bật/tắt yêu thích. Trả về true nếu sau thao tác là "đã thích". */
  toggle: (idBaiDang: number) =>
    client.post<{ daThich: boolean }>(`/yeu-thich/${idBaiDang}`).then((r) => r.data.daThich),
  danhSach: (page = 1, pageSize = 20) =>
    client.get<PagedResult<YeuThich>>("/yeu-thich", { params: { page, pageSize } }).then((r) => r.data),
};
