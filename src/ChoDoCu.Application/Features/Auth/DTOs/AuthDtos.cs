namespace ChoDoCu.Application.Features.Auth.DTOs;

public record DangKyRequest(
    string HoTen,
    string Email,
    string SoDienThoai,
    string MatKhau,
    DateTime NgaySinh,
    string GioiTinh);

public record DangNhapRequest(string Email, string MatKhau);

public record AuthResponse(string Token, int IdNguoiDung, string HoTen, string Role);
