// Các kiểu dưới đây khớp 1-1 với DTO trong ChoDoCu.Application (ASP.NET trả JSON camelCase).

export type Role = "Admin" | "Moderator" | "User";

export interface AuthResponse {
  token: string;
  idNguoiDung: number;
  hoTen: string;
  role: string;
}
export interface DangNhapRequest {
  email: string;
  matKhau: string;
}
export interface DangKyRequest {
  hoTen: string;
  email: string;
  soDienThoai: string;
  matKhau: string;
  ngaySinh: string; // yyyy-MM-dd
  gioiTinh: "Nam" | "Nữ" | "Khác";
}

export interface DoiMatKhauRequest {
  matKhauCu: string;
  matKhauMoi: string;
  xacNhanMatKhau: string;
}

export interface HoSoNguoiDung {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string;
  ngaySinh: string | null; // yyyy-MM-dd
  gioiTinh: string | null; // "Nam" | "Nữ" | "Khác" hoặc giá trị khác do BE trả (vd. chưa xác định)
  tenGianHang?: string | null;
  idThanhPho?: number | null;
  idPhuongXa?: number | null;
  diaChiChiTiet?: string | null; // số nhà, đường
  gioiThieu?: string | null;
  soDienThoaiDaXacThuc?: boolean;
  cccdDaMa?: string | null; // đã che bớt, ví dụ 079095******
}
export type CapNhatHoSoRequest = Pick<HoSoNguoiDung, "hoTen" | "soDienThoai" | "ngaySinh"> &
  Partial<Pick<HoSoNguoiDung, "gioiTinh" | "tenGianHang" | "idThanhPho" | "idPhuongXa" | "diaChiChiTiet" | "gioiThieu">>;
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---- Bài đăng ----
export type TrangThaiBaiDang = "ChoDuyet" | "DaDuyet" | "TuChoi" | "DaAn";

export interface BaiDang {
  id: number;
  tieuDe: string;
  noiDung: string;
  tenSanPham: string;
  giaTien: number;
  diaChi: string;
  diaChiChiTiet: string;
  ngayDang: string;
  trangThai: TrangThaiBaiDang;
  idNguoiDung: number;
  tenNguoiDang: string;
  tenDanhMuc: string;
  tenThanhPho: string;
  anhs: string[];
}
export interface TaoBaiDangRequest {
  tieuDe: string;
  noiDung: string;
  tenSanPham: string;
  giaTien: number;
  moTa: string;
  idDanhMuc: number;
  idThanhPho: number;
  idPhuongXa: number | null;
  diaChi: string;
  diaChiChiTiet: string;
  urlAnhs: string[];
}
export interface TimBaiDangParams {
  idDanhMuc?: number;
  idThanhPho?: number;
  tuKhoa?: string;
  page?: number;
  pageSize?: number;
}

// ---- Danh mục / địa chỉ ----
export interface DanhMuc {
  id: number;
  idDanhMucCha: number | null;
  tenDanhMuc: string;
  anhDanhMuc: string | null;
  trangThai: string;
  danhMucCons: DanhMuc[];
}
export interface ThanhPho {
  id: number;
  tenThanhPho: string;
}
export interface PhuongXa {
  id: number;
  idThanhPho: number;
  tenPhuongXa: string;
}

// ---- Tương tác ----
export interface YeuThich {
  id: number;
  idBaiDang: number;
  tieuDe: string;
  giaTien: number;
  anhDaiDien: string | null;
  ngayTao: string;
}
export interface ThongBao {
  id: number;
  tieuDe: string;
  noiDung: string | null;
  ngayTao: string;
  trangThai: string; // "ChuaDoc" | "DaDoc"
}
export interface BaoCao {
  id: number;
  idBaiDang: number;
  tieuDeBaiDang: string;
  idNguoiDung: number;
  tenNguoiBaoCao: string;
  noiDung: string | null;
  ngayTao: string;
  trangThai: string;
}
export interface HoiThoai {
  id: number;
  idNguoiDungKia: number;
  tenNguoiDungKia: string;
  anhNguoiDungKia: string | null;
  tinNhanCuoi: string | null;
}
export interface TinNhan {
  id: number;
  idHoiThoai: number;
  idNguoiGui: number;
  noiDung: string;
  daXem: boolean;
  ngayTao: string;
}
export interface LichSuTimKiem {
  id: number;
  tuKhoa: string;
  ngayTao: string;
}

// ---- Banner / dịch vụ / thanh toán ----
export interface Banner {
  id: number;
  hinhAnh: string | null;
  viTri: string | null;
  ngaySua: string | null;
}
export interface DichVu {
  id: number;
  tenDichVu: string;
  gia: number;
  thoiGianDichVu: number;
}
export interface MuaDichVuResponse {
  idMuaDichVu: number;
  idThanhToan: number;
  tenDichVu: string;
  tongTien: number;
  trangThai: string;
  ngayTao: string;
}
