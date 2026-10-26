import client from "./client";
import type { BaiDang, PagedResult, TaoBaiDangRequest, TimBaiDangParams } from "../types";

export const baiDangApi = {
  tim: (params: TimBaiDangParams) => client.get<PagedResult<BaiDang>>("/bai-dang", { params }).then((r) => r.data),
  chiTiet: (id: number) => client.get<BaiDang>(`/bai-dang/${id}`).then((r) => r.data),
  tao: (data: TaoBaiDangRequest) => client.post<BaiDang>("/bai-dang", data).then((r) => r.data),
  duyet: (id: number) => client.put(`/bai-dang/${id}/duyet`).then(() => undefined),
  /** Tin của người đang đăng nhập, mọi trạng thái. */
  cuaToi: (page = 1, pageSize = 100) =>
    client.get<PagedResult<BaiDang>>("/bai-dang/cua-toi", { params: { page, pageSize } }).then((r) => r.data),
  /** Ẩn tin khỏi trang công khai / hiện lại. */
  an: (id: number) => client.put(`/bai-dang/${id}/an`).then(() => undefined),
  hien: (id: number) => client.put(`/bai-dang/${id}/hien`).then(() => undefined),
  tuChoi: (id: number) => client.put(`/bai-dang/${id}/tu-choi`).then(() => undefined),
};
