using ChoDoCu.Domain.Enums;

namespace ChoDoCu.Application.Features.Account.DTOs;

public record HoSoResponse(
    int Id,
    string HoTen,
    string Email,
    string SoDienThoai,
    DateTime NgaySinh,
    string GioiTinh,
    string? AnhNguoiDung,
    int? IdThanhPho,
    string? TenThanhPho,
    int? IdPhuongXa,
    string? TenPhuongXa,
    int LuotDang,
    int LuotDay,
    DateTime NgayTao,
    string TrangThai,
    IReadOnlyList<string> Roles,
    string? TenGianHang = null,
    string? DiaChiChiTiet = null,
    string? GioiThieu = null);

/// <param name="SoDienThoai">Rỗng/null = giữ nguyên số hiện có.</param>
/// <param name="NgaySinh">null = giữ nguyên.</param>
/// <param name="GioiTinh">Rỗng/null = giữ nguyên.</param>
/// <param name="AnhNguoiDung">null = giữ nguyên; chuỗi rỗng = xóa ảnh; có giá trị = đổi ảnh.</param>
public record CapNhatHoSoRequest(
    string HoTen,
    string? SoDienThoai,
    DateTime? NgaySinh,
    string? GioiTinh,
    string? AnhNguoiDung,
    int? IdThanhPho,
    int? IdPhuongXa,
    string? TenGianHang = null,
    string? DiaChiChiTiet = null,
    string? GioiThieu = null);

public record NguoiDungListItem(
    int Id,
    string HoTen,
    string Email,
    string SoDienThoai,
    string GioiTinh,
    string? AnhNguoiDung,
    string TrangThai,
    DateTime NgayTao,
    int LuotDang,
    DateTimeOffset? KhoaTamDen,
    IReadOnlyList<string> Roles);
/// <summary>Bước 1: yêu cầu đổi số. Hệ thống gửi mã xác nhận 6 chữ số tới EMAIL của tài khoản.</summary>
public record YeuCauDoiSoDienThoaiRequest(string SoDienThoaiMoi);

/// <summary>Bước 2: nhập mã nhận được qua email để xác nhận đổi sang SoDienThoaiMoi.</summary>
public record XacNhanDoiSoDienThoaiRequest(string SoDienThoaiMoi, string MaXacNhan);
