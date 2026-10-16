using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Auth.DTOs;

namespace ChoDoCu.Application.Features.Auth.Interfaces;

public interface IAuthService
{
    Task<Result<AuthResponse>> DangKyAsync(DangKyRequest request);
    Task<Result<AuthResponse>> DangNhapAsync(DangNhapRequest request);

    Task<Result<bool>> DoiMatKhauAsync(int idNguoiDung, DoiMatKhauRequest request);

    /// <summary>Luôn xong "thành công" dù email có tồn tại hay không, để không lộ email nào đã đăng ký.</summary>
    Task QuenMatKhauAsync(QuenMatKhauRequest request);

    Task<Result<bool>> DatLaiMatKhauAsync(DatLaiMatKhauRequest request);
}
