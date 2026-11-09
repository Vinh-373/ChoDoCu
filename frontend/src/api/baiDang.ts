import client from "./client";
import type {
  BaiDang,
  BaiDangChoDuyetParams,
  BaiDangChoDuyetResponse,
  BaiDangCuaToiParams,
  BaiDangCuaToiResponse,
  BaiDangQuanTriParams,
  BaiDangQuanTriResponse,
  PagedResult,
  SuaBaiDangRequest,
  TaoBaiDangRequest,
  TimBaiDangParams,
  ThongKeBaiDangResponse,
  ThongKeQuanTriResponse,
  TuChoiBaiDangRequest,
} from "../types";

function layDanhSachCuaToi(page?: number, pageSize?: number): Promise<PagedResult<BaiDang>>;
function layDanhSachCuaToi(params: BaiDangCuaToiParams): Promise<PagedResult<BaiDangCuaToiResponse>>;
function layDanhSachCuaToi(
  pageOrParams: number | BaiDangCuaToiParams = 1,
  pageSize = 100,
) {
  const params = typeof pageOrParams === "number"
    ? { page: pageOrParams, pageSize }
    : pageOrParams;
  return client.get<PagedResult<BaiDang | BaiDangCuaToiResponse>>("/bai-dang/cua-toi", { params })
    .then((r) => r.data);
}

export const baiDangApi = {
  /** Tìm kiếm tin công khai. */
  timKiem: (params: TimBaiDangParams) =>
    client.get<PagedResult<BaiDang>>("/bai-dang", { params }).then((r) => r.data),
  /** Tải ảnh hoặc video lên và nhận đường dẫn tương đối. */
  taiTep: (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.post<{ duongDan: string }>("/bai-dang/tep", formData, {
      onUploadProgress: (event) => {
        if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    }).then((r) => r.data);
  },
  sua: (id: number, data: SuaBaiDangRequest) =>
    client.put<BaiDang>(`/bai-dang/${id}`, data).then((r) => r.data),
  thongKeCuaToi: () =>
    client.get<ThongKeBaiDangResponse>("/bai-dang/cua-toi/thong-ke").then((r) => r.data),
  /** Danh sách chờ duyệt dành cho quản trị viên. */
  choDuyet: (params: BaiDangChoDuyetParams = {}) =>
    client.get<PagedResult<BaiDangChoDuyetResponse>>("/bai-dang/cho-duyet", { params }).then((r) => r.data),
  quanTri: (params: BaiDangQuanTriParams = {}) =>
    client.get<PagedResult<BaiDangQuanTriResponse>>("/bai-dang/quan-tri", { params }).then((r) => r.data),
  thongKeQuanTri: () =>
    client.get<ThongKeQuanTriResponse>("/bai-dang/quan-tri/thong-ke").then((r) => r.data),
  daBan: (id: number) => client.put(`/bai-dang/${id}/da-ban`).then(() => undefined),
  huyDang: (id: number) => client.put(`/bai-dang/${id}/huy-dang`).then(() => undefined),
  xoa: (id: number) => client.delete(`/bai-dang/${id}`).then(() => undefined),
  dayTin: (id: number) => client.post(`/bai-dang/${id}/day-tin`).then(() => undefined),
  giaHan: (id: number) => client.post(`/bai-dang/${id}/gia-han`).then(() => undefined),
  tim: (params: TimBaiDangParams) => client.get<PagedResult<BaiDang>>("/bai-dang", { params }).then((r) => r.data),
  chiTiet: (id: number) => client.get<BaiDang>(`/bai-dang/${id}`).then((r) => r.data),
  tao: (data: TaoBaiDangRequest) =>
    client.post<BaiDang>("/bai-dang", data).then((r) => r.data),
  duyet: (id: number) => client.put(`/bai-dang/${id}/duyet`).then(() => undefined),
  /** Tin của người đang đăng nhập, mọi trạng thái. */
  cuaToi: layDanhSachCuaToi,
  /** Ẩn tin khỏi trang công khai / hiện lại. */
  an: (id: number) => client.put(`/bai-dang/${id}/an`).then(() => undefined),
  hien: (id: number) => client.put(`/bai-dang/${id}/hien`).then(() => undefined),
  tuChoi: (id: number, data?: TuChoiBaiDangRequest) =>
    client.put(`/bai-dang/${id}/tu-choi`, data).then(() => undefined),
};
