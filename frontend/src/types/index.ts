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
  soDienThoai: string | null;
  ngaySinh: string | null; // yyyy-MM-dd
  gioiTinh: string | null; // "Nam" | "Nữ" | "Khác" hoặc giá trị khác do BE trả (vd. chưa xác định)
  tenGianHang?: string | null;
  idThanhPho?: number | null;
  idPhuongXa?: number | null;
  diaChiChiTiet?: string | null; // số nhà, đường
  gioiThieu?: string | null;
  soDienThoaiDaXacThuc?: boolean;
  cccdDaMa?: string | null; // đã che bớt, ví dụ 079095******
  luotDang: number;
  luotDay: number;
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
export type TrangThaiBaiDang = "ChoDuyet" | "DaDuyet" | "BiTuChoi" | "DaAn" | "DaBan";

export interface BaiDang {
  id: number;
  maTin?: string;
  tieuDe: string;
  noiDung: string;
  tenSanPham: string;
  giaTien: number;
  diaChi: string;
  diaChiChiTiet: string;
  ngayDang: string;
  ngayDayTin?: string | null;
  laTinUuTien?: boolean;
  trangThai: TrangThaiBaiDang;
  idNguoiDung: number;
  idDanhMuc?: number | null;
  idThanhPho?: number | null;
  idPhuongXa?: number | null;
  tenNguoiDang: string;
  tenDanhMuc: string;
  tenThanhPho: string;
  anhs: string[];
  anhBia?: string | null;
  tenDanhMucDayDu?: string | null;
  khuVuc?: string | null;
  soDienThoaiLienHe?: string | null;
  coThuongLuong?: boolean | null;
  giaChotNhanh?: boolean | null;
  choPhepChat?: boolean | null;
  lyDoTuChoi?: string | null;
  ngayHetHan?: string | null;
  daHetHan?: boolean;
  luotXem?: number;
  luotLuu?: number;
  soCuocChat?: number;
  nguoiBan?: NguoiBanResponse | null;
  thuocTinhs?: BaiDangThuocTinhResponse[] | null;
  thuocTinhsDeSua?: BaiDangThuocTinhSuaResponse[] | null;
  danhSachMedia?: BaiDangMediaResponse[] | null;
}

export interface BaiDangMediaResponse {
  duongDan: string;
  laVideo: boolean;
}

export interface NguoiBanResponse {
  id: number;
  hoTen: string;
  anhNguoiDung: string | null;
}

export interface BaiDangThuocTinhResponse {
  tenThuocTinh: string;
  tenGiaTri: string;
}

export interface BaiDangThuocTinhSuaResponse {
  idThuocTinh: number;
  giaTri: string;
}

export interface BaiDangChiTietProjection {
  id: number;
  maTin: string;
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
  anhNguoiDang: string | null;
  tenDanhMuc: string;
  tenThanhPho: string;
  tenDanhMucDayDu: string;
  khuVuc: string;
  soDienThoaiLienHe: string;
  coThuongLuong: boolean;
  giaChotNhanh: boolean;
  choPhepChat: boolean;
  lyDoTuChoi: string | null;
  luotXem: number;
  luotLuu: number;
}

export interface BaiDangCuaToiResponse {
  id: number;
  anhBia: string | null;
  tieuDe: string;
  giaTien: number;
  tenDanhMuc: string;
  maTin: string;
  ngayDang: string;
  khuVuc: string;
  luotXem: number;
  luotLuu: number;
  trangThai: TrangThaiBaiDang;
  lyDoTuChoi: string | null;
  ngayHetHan: string | null;
  daHetHan: boolean;
}

export interface BaiDangChoDuyetResponse {
  id: number;
  maTin: string;
  tieuDe: string;
  giaTien: number;
  anhBia: string | null;
  tenDanhMuc: string;
  nguoiDang: NguoiDangChoDuyetResponse;
  ngayDang: string;
  khuVuc: string;
}

export interface BaiDangQuanTriResponse {
  id: number;
  maTin: string;
  tieuDe: string;
  giaTien: number;
  coThuongLuong: boolean;
  anhBia: string | null;
  tenDanhMuc: string;
  nguoiDang: {
    id: number;
    ten: string;
    soDienThoai: string;
  };
  ngayDang: string;
  khuVuc: string;
  trangThai: TrangThaiBaiDang;
  lyDoTuChoi: string | null;
}

export interface BaiDangQuanTriParams {
  trangThai?: TrangThaiBaiDang;
  keyword?: string;
  idDanhMuc?: number;
  page?: number;
  pageSize?: number;
}

export interface ThongKeQuanTriResponse {
  tongSo: number;
  choDuyet: number;
  daDuyet: number;
  biTuChoi: number;
  daAn: number;
  daBan: number;
  moiHomNay: number;
}

export interface NguoiDangChoDuyetResponse {
  id: number;
  ten: string;
}

export interface ThongKeTrangThaiBaiDang {
  trangThai: string;
  soLuong: number;
}

export interface ThongKeBaiDangResponse {
  theoTrangThai: ThongKeTrangThaiBaiDang[];
  tongSo: number;
}

export interface TaoBaiDangThuocTinhRequest {
  idThuocTinh: number;
  giaTri: string;
}

export interface TaoBaiDangHinhAnhRequest {
  duongDan: string;
  laVideo: boolean;
  laAnhBia: boolean;
}

export interface TaoBaiDangRequest {
  idDanhMuc: number;
  moTa: string;
  gia: number;
  coThuongLuong: boolean;
  giaChotNhanh: boolean;
  idThanhPho: number;
  idPhuongXa: number | null;
  diaChiChiTiet: string | null;
  soDienThoaiLienHe: string | null;
  choPhepChat: boolean;
  tieuDe?: string | null;
  thuocTinhs: TaoBaiDangThuocTinhRequest[];
  danhSachHinhAnh: TaoBaiDangHinhAnhRequest[];
}

export type SuaBaiDangRequest = TaoBaiDangRequest;

export interface TuChoiBaiDangRequest {
  lyDo: string;
}

export interface TimBaiDangParams {
  keyword?: string;
  idDanhMuc?: number;
  idThanhPho?: number;
  idPhuongXa?: number;
  giaTu?: number;
  giaDen?: number;
  sapXep?: "uuTien" | "moiNhat" | "giaTang" | "giaGiam" | "xemNhieu";
  page?: number;
  pageSize?: number;
}

export interface BaiDangCuaToiParams {
  trangThai?: TrangThaiBaiDang;
  keyword?: string;
  idDanhMuc?: number;
  sapXep?: "moiNhat" | "cuNhat" | "giaTang" | "giaGiam" | "xemNhieu";
  page?: number;
  pageSize?: number;
}

export interface BaiDangChoDuyetParams {
  keyword?: string;
  idDanhMuc?: number;
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
export interface DanhMucGiaTriLuaChon {
  giaTri: string;
  ten: string;
  idGiaTriCha: string | number | null;
}
export interface DanhMucThuocTinh {
  id: number;
  tenThuocTinh: string;
  kieuDuLieu: "LuaChon" | "So";
  batBuoc: boolean;
  danhSachLuaChon: DanhMucGiaTriLuaChon[];
  thuTu: number;
  idThuocTinhCha: number | null;
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
  luotDang: number;
  luotDay: number;
}
// DTO riêng cho API quản trị, khớp DichVuResponse của backend.
export interface DichVuQuanTri extends DichVu {
  luotDay: number;
  luotDang: number;
  ngayTao: string;
  trangThai: string;
}
// Request thêm/sửa khớp TaoDichVuRequest và CapNhatDichVuRequest.
export interface DichVuQuanTriRequest {
  tenDichVu: string;
  gia: number;
  thoiGianDichVu: number;
  luotDay: number;
  luotDang: number;
}
export interface MuaDichVuResponse {
  idMuaDichVu: number;
  idThanhToan: number;
  maGiaoDichNgoai: string;
  tenDichVu: string;
  tongTien: number;
  trangThai: string;
  urlThanhToan: string;
  ngayTao: string;
}
export interface PhuongThucThanhToan {
  id: number;
  tenPhuongThuc: string;
  moTa: string | null;
}
export interface ThanhToanTrangThai {
  idThanhToan: number;
  trangThai: string;
  tongTien: number;
  ngayTao: string;
  ngayThanhToan: string | null;
}
export interface LichSuThanhToanDichVu {
  idThanhToan: number;
  tongTien: number;
  trangThai: string;
  maGiaoDichCongTT: string | null;
  ngayTao: string;
  ngayThanhToan: string | null;
}
export interface LichSuMuaDichVu {
  idMuaDichVu: number;
  idDichVu: number;
  tenDichVu: string;
  gia: number;
  thoiGianDichVu: number;
  ngayMua: string;
  ngayHetHan: string | null;
  trangThai: string;
  thanhToans: LichSuThanhToanDichVu[];
}
