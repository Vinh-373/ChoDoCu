import client from "./client";
import type { BaiDang, PagedResult, TaoBaiDangRequest, TimBaiDangParams } from "../types";

export const baiDangApi = {
  tim: (params: TimBaiDangParams) => client.get<PagedResult<BaiDang>>("/bai-dang", { params }).then((r) => r.data),
  chiTiet: (id: number) => client.get<BaiDang>(`/bai-dang/${id}`).then((r) => r.data),
  tao: (data: TaoBaiDangRequest) => client.post<BaiDang>("/bai-dang", data).then((r) => r.data),
  duyet: (id: number) => client.put(`/bai-dang/${id}/duyet`).then(() => undefined),
  tuChoi: (id: number) => client.put(`/bai-dang/${id}/tu-choi`).then(() => undefined),
};
