
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
    List<BaiDangThuocTinhResponse>? ThuocTinhs = null
);

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

public record TuChoiBaiDangRequest(string? LyDo);

public record BaiDangThuocTinhResponse(string TenThuocTinh, string TenGiaTri);

public record BaiDangThuocTinhProjection(
    string TenThuocTinh,
    string? GiaTri,
    List<string> DanhSachGiaTriLuaChon
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
    int LuotLuu
);

public record ThongKeTrangThaiBaiDang(string TrangThai, int SoLuong);

public record ThongKeBaiDangResponse(
    IReadOnlyList<ThongKeTrangThaiBaiDang> TheoTrangThai,
    int TongSo
);

public record NguoiBanResponse(int Id, string HoTen, string? AnhNguoiDung);
