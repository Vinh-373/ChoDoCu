import client from "./client";
import type {
  AdminAttribute,
  AdminBrand,
  AdminDashboardStats,
  AdminProduct,
  PagedResult,
} from "../types";

interface PageParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export const adminApi = {
  dashboard: () => client.get<AdminDashboardStats>("/admin/dashboard").then((r) => r.data),

  sanPham: (params: PageParams & { idDanhMuc?: number; idHang?: number }) =>
    client.get<PagedResult<AdminProduct>>("/admin/san-pham", { params }).then((r) => r.data),
  taoSanPham: (data: Omit<AdminProduct, "id" | "tenDanhMuc" | "tenHang">) =>
    client.post<AdminProduct>("/admin/san-pham", data).then((r) => r.data),
  capNhatSanPham: (id: number, data: Omit<AdminProduct, "id" | "tenDanhMuc" | "tenHang">) =>
    client.put<AdminProduct>(`/admin/san-pham/${id}`, data).then((r) => r.data),
  xoaSanPham: (id: number) => client.delete(`/admin/san-pham/${id}`).then(() => undefined),

  hang: (params: PageParams) =>
    client.get<PagedResult<AdminBrand>>("/admin/hang", { params }).then((r) => r.data),
  taoHang: (data: Omit<AdminBrand, "id">) => client.post<AdminBrand>("/admin/hang", data).then((r) => r.data),
  capNhatHang: (id: number, data: Omit<AdminBrand, "id">) =>
    client.put<AdminBrand>(`/admin/hang/${id}`, data).then((r) => r.data),
  xoaHang: (id: number) => client.delete(`/admin/hang/${id}`).then(() => undefined),

  thuocTinh: (params: PageParams & { idDanhMuc?: number }) =>
    client.get<PagedResult<AdminAttribute>>("/admin/thuoc-tinh", { params }).then((r) => r.data),
  taoThuocTinh: (data: Omit<AdminAttribute, "id" | "ngayTao">) =>
    client.post<AdminAttribute>("/admin/thuoc-tinh", data).then((r) => r.data),
  capNhatThuocTinh: (id: number, data: Omit<AdminAttribute, "id" | "ngayTao">) =>
    client.put<AdminAttribute>(`/admin/thuoc-tinh/${id}`, data).then((r) => r.data),
  xoaThuocTinh: (id: number) => client.delete(`/admin/thuoc-tinh/${id}`).then(() => undefined),
};
