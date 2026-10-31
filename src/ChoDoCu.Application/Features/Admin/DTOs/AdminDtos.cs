namespace ChoDoCu.Application.Features.Admin.DTOs;

public record AdminDashboardResponse(int Users, int Posts, int Transactions, int Reports);

public record TaoSanPhamRequest(
    int IdDanhMuc,
    int? IdHang,
    int? IdDongSanPham,
    int? IdDongCuThe,
    string TenSanPham,
    decimal GiaTien,
    string MoTa);

public record SanPhamAdminResponse(
    int Id,
    int IdDanhMuc,
    string TenDanhMuc,
    int? IdHang,
    string? TenHang,
    int? IdDongSanPham,
    int? IdDongCuThe,
    string TenSanPham,
    decimal GiaTien,
    string MoTa);

public record TaoHangRequest(string TenHang, string? Logo, string TrangThai);
public record HangAdminResponse(int Id, string? TenHang, string? Logo, string TrangThai);

public record TaoThuocTinhRequest(
    int? IdDanhMuc,
    int? IdThuocTinhCha,
    string TenThuocTinh,
    string KieuDuLieu,
    IReadOnlyList<string> DanhSachGiaTriLuaChon,
    bool BatBuoc,
    int ThuTu,
    string TrangThai);

public record ThuocTinhAdminResponse(
    int Id,
    int? IdDanhMuc,
    int? IdThuocTinhCha,
    string TenThuocTinh,
    string KieuDuLieu,
    IReadOnlyList<string> DanhSachGiaTriLuaChon,
    bool BatBuoc,
    int ThuTu,
    string TrangThai,
    DateTime NgayTao);
