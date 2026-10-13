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
    IReadOnlyList<string> Roles);

/// <param name="AnhNguoiDung">Đường dẫn/URL ảnh đại diện; null hoặc rỗng = xóa ảnh.</param>
public record CapNhatHoSoRequest(
    string HoTen,
    string SoDienThoai,
    DateTime NgaySinh,
    string GioiTinh,
    string? AnhNguoiDung,
    int? IdThanhPho,
    int? IdPhuongXa);

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
