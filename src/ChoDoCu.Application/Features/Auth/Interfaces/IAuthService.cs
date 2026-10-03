using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Auth.DTOs;

namespace ChoDoCu.Application.Features.Auth.Interfaces;

public interface IAuthService
{
    Task<Result<AuthResponse>> DangKyAsync(DangKyRequest request);
    Task<Result<AuthResponse>> DangNhapAsync(DangNhapRequest request);
}
