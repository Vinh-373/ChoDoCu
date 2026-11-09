
namespace ChoDoCu.Application.Features.Post.DTOs;

public record TaoBaiDangRequest(
    int IdDanhMuc,
    string MoTa,
    decimal Gia,
    bool CoThuongLuong,
    bool GiaChotNhanh,
    int IdThanhPho,
    int? IdPhuongXa,
    string? DiaChiChiTiet,
    string? SoDienThoaiLienHe,
    bool ChoPhepChat,
    string? TieuDe,
    List<TaoBaiDangThuocTinhRequest> ThuocTinhs,
    List<TaoBaiDangHinhAnhRequest> DanhSachHinhAnh
);

public record TaoBaiDangThuocTinhRequest(int IdThuocTinh, string GiaTri);

public record TaoBaiDangHinhAnhRequest(string DuongDan, bool LaVideo, bool LaAnhBia);

public record BaiDangResponse(
    int Id,
    string MaTin,
    string TieuDe,
    string NoiDung,
    string TenSanPham,
    decimal GiaTien,
    string DiaChi,
    string DiaChiChiTiet,
    DateTime NgayDang,
    string TrangThai,
    int IdNguoiDung,
    string TenNguoiDang,
    string TenDanhMuc,
    string TenThanhPho,
    List<string> Anhs,
    string? AnhBia = null,
    string? TenDanhMucDayDu = null,
    string? KhuVuc = null,
    string? SoDienThoaiLienHe = null,
    bool? CoThuongLuong = null,
    bool? GiaChotNhanh = null,
    bool? ChoPhepChat = null,
    string? LyDoTuChoi = null,
    int LuotXem = 0,
    int LuotLuu = 0,
    int SoCuocChat = 0,
    NguoiBanResponse? NguoiBan = null,
    List<BaiDangThuocTinhResponse>? ThuocTinhs = null,
    List<BaiDangMediaResponse>? DanhSachMedia = null,
    DateTime? NgayHetHan = null,
    bool DaHetHan = false,
    int? IdDanhMuc = null,
    int? IdThanhPho = null,
    int? IdPhuongXa = null,
    List<BaiDangThuocTinhSuaResponse>? ThuocTinhsDeSua = null,
    DateTime? NgayDayTin = null,
    bool LaTinUuTien = false
);

public record BaiDangMediaResponse(string DuongDan, bool LaVideo);

public record BaiDangCuaToiResponse(
    int Id,
    string? AnhBia,
    string TieuDe,
    decimal GiaTien,
    string TenDanhMuc,
    string MaTin,
    DateTime NgayDang,
    string KhuVuc,
    int LuotXem,
    int LuotLuu,
    string TrangThai,
    string? LyDoTuChoi,
    DateTime? NgayHetHan,
    bool DaHetHan
);

public record BaiDangChoDuyetResponse(
    int Id,
    string MaTin,
    string TieuDe,
    decimal GiaTien,
    string? AnhBia,
    string TenDanhMuc,
    NguoiDangChoDuyetResponse NguoiDang,
    DateTime NgayDang,
    string KhuVuc
);

public record NguoiDangChoDuyetResponse(int Id, string Ten);

public record BaiDangQuanTriResponse(
    int Id,
    string MaTin,
    string TieuDe,
    decimal GiaTien,
    bool CoThuongLuong,
    string? AnhBia,
    string TenDanhMuc,
    NguoiDangQuanTriResponse NguoiDang,
    DateTime NgayDang,
    string KhuVuc,
    string TrangThai,
    string? LyDoTuChoi
);

public record NguoiDangQuanTriResponse(int Id, string Ten, string SoDienThoai);

public record TuChoiBaiDangRequest(string? LyDo);

public record BaiDangThuocTinhResponse(string TenThuocTinh, string TenGiaTri);
public record BaiDangThuocTinhSuaResponse(int IdThuocTinh, string GiaTri);

public record BaiDangThuocTinhProjection(
    string TenThuocTinh,
    string? GiaTri,
    List<string> DanhSachGiaTriLuaChon,
    int IdThuocTinh
);

public record BaiDangChiTietProjection(
    int Id,
    string MaTin,
    string TieuDe,
    string NoiDung,
    string TenSanPham,
    decimal GiaTien,
    string DiaChi,
    string DiaChiChiTiet,
    DateTime NgayDang,
    string TrangThai,
    int IdNguoiDung,
    string TenNguoiDang,
    string? AnhNguoiDang,
    string TenDanhMuc,
    string TenThanhPho,
    string TenDanhMucDayDu,
    string KhuVuc,
    string SoDienThoaiLienHe,
    bool CoThuongLuong,
    bool GiaChotNhanh,
    bool ChoPhepChat,
    string? LyDoTuChoi,
    int LuotXem,
    int LuotLuu,
    DateTime? NgayHetHan,
    bool DaHetHan,
    int IdDanhMuc,
    int IdThanhPho,
    int? IdPhuongXa,
    DateTime? NgayDayTin,
    bool LaTinUuTien
);

public record ThongKeTrangThaiBaiDang(string TrangThai, int SoLuong);

public record ThongKeBaiDangResponse(
    IReadOnlyList<ThongKeTrangThaiBaiDang> TheoTrangThai,
    int TongSo
);

public record ThongKeBaiDangQuanTriResponse(
    int TongSo,
    int ChoDuyet,
    int DaDuyet,
    int BiTuChoi,
    int DaAn,
    int DaBan,
    int MoiHomNay
);

public record NguoiBanResponse(int Id, string HoTen, string? AnhNguoiDung);
