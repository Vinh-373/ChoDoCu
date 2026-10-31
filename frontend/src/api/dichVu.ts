import client from "./client";
import type { DichVu, DichVuQuanTri, DichVuQuanTriRequest, LichSuMuaDichVu, MuaDichVuResponse, PhuongThucThanhToan, ThanhToanTrangThai } from "../types";

export const dichVuApi = {
  danhSach: () => client.get<DichVu[]>("/dich-vu").then((r) => r.data),
  // Các lời gọi dưới đây dành cho trang quản trị; backend kiểm tra permission trên từng endpoint.
  danhSachQuanTri: () => client.get<DichVuQuanTri[]>("/dich-vu/quan-tri").then((r) => r.data),
  taoQuanTri: (data: DichVuQuanTriRequest) => client.post<DichVuQuanTri>("/dich-vu", data).then((r) => r.data),
  capNhatQuanTri: (id: number, data: DichVuQuanTriRequest) =>
    client.put<DichVuQuanTri>(`/dich-vu/${id}`, data).then((r) => r.data),
  ngungBan: (id: number) => client.delete(`/dich-vu/${id}`).then(() => undefined),
  kichHoat: (id: number) => client.put(`/dich-vu/${id}/kich-hoat`).then(() => undefined),
  phuongThucThanhToan: () => client.get<PhuongThucThanhToan[]>("/thanh-toan/phuong-thuc").then((r) => r.data),
  lichSuMua: () => client.get<LichSuMuaDichVu[]>("/thanh-toan/lich-su-mua-dich-vu").then((r) => r.data),
  trangThai: (idThanhToan: number) =>
    client.get<ThanhToanTrangThai>(`/thanh-toan/${idThanhToan}/trang-thai`).then((r) => r.data),
  mua: (idDichVu: number, idPhuongThucTT: number) =>
    client.post<MuaDichVuResponse>("/thanh-toan/mua-dich-vu", { idDichVu, idPhuongThucTT }).then((r) => r.data),
};
