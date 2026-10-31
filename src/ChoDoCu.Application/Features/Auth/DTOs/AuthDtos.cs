namespace ChoDoCu.Application.Features.Auth.DTOs;

public record DangKyRequest(
    string HoTen,
    string Email,
    string SoDienThoai,
    string MatKhau,
    DateTime NgaySinh,
    string GioiTinh);

public record DangNhapRequest(string Email, string MatKhau);

public record DoiMatKhauRequest(string MatKhauCu, string MatKhauMoi);

public record QuenMatKhauRequest(string Email);

/// <param name="Token">Token trong liên kết email (client gửi nguyên giá trị đã giải mã URL).</param>
public record DatLaiMatKhauRequest(string Email, string MaOTP, string MatKhauMoi);

/// <param name="Role">Role chính (đầu tiên) — giữ lại để tương thích client cũ.</param>
/// <param name="Roles">Mọi Role của người dùng.</param>
/// <param name="Permissions">Mọi mã quyền chi tiết của người dùng, để client ẩn/hiện chức năng.</param>
public record AuthResponse(
    string Token,
    DateTime ExpiresAtUtc,
    int IdNguoiDung,
    string HoTen,
    string Email,
    string Role,
    IReadOnlyList<string> Roles,
    IReadOnlyList<string> Permissions);
public record DangNhapGoogleRequest(string IdToken);
public record XacNhanMaDatLaiRequest(string Email, string MaXacNhan);
