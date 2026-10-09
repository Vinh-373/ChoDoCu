using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Auth.DTOs;
using ChoDoCu.Application.Features.Auth.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Identity;

namespace ChoDoCu.Application.Features.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _uow;
    private readonly UserManager<NguoiDung> _userManager;
    private readonly IJwtService _jwt;
    private readonly IValidator<DangKyRequest> _dangKyValidator;
    private readonly IValidator<DangNhapRequest> _dangNhapValidator;

    public AuthService(
        IUnitOfWork uow,
        UserManager<NguoiDung> userManager,
        IJwtService jwt,
        IValidator<DangKyRequest> dangKyValidator,
        IValidator<DangNhapRequest> dangNhapValidator)
    {
        _uow = uow;
        _userManager = userManager;
        _jwt = jwt;
        _dangKyValidator = dangKyValidator;
        _dangNhapValidator = dangNhapValidator;
    }

    public async Task<Result<AuthResponse>> DangKyAsync(DangKyRequest request)
    {
        await _dangKyValidator.ValidateAndThrowAsync(request);

        var email = request.Email.Trim().ToLowerInvariant();

        // Code cũ dùng repository và BCrypt:
        // if (await _uow.NguoiDungs.EmailDaTonTaiAsync(email))
        //     return Result<AuthResponse>.Fail("Email đã được sử dụng.");
        // if (await _uow.NguoiDungs.SoDienThoaiDaTonTaiAsync(request.SoDienThoai))
        //     return Result<AuthResponse>.Fail("Số điện thoại đã được sử dụng.");
        // var nguoiDungCu = new NguoiDung { ..., PasswordHash = _hasher.Hash(request.MatKhau) };
        // await _uow.NguoiDungs.AddAsync(nguoiDungCu);
        // await _uow.SaveChangesAsync();

        // Cách mới: kiểm tra trùng và để UserManager tạo password hash của Identity.
        if (await _userManager.FindByEmailAsync(email) is not null
            || await _uow.NguoiDungs.EmailDaTonTaiAsync(email))
            return Result<AuthResponse>.Fail("Email đã được sử dụng.");

        if (await _uow.NguoiDungs.SoDienThoaiDaTonTaiAsync(request.SoDienThoai))
            return Result<AuthResponse>.Fail("Số điện thoại đã được sử dụng.");

        var nguoiDung = new NguoiDung
        {
            UserName = email,
            Email = email,
            HoTen = request.HoTen.Trim(),
            SoDienThoai = request.SoDienThoai,
            PhoneNumber = request.SoDienThoai,
            NgaySinh = request.NgaySinh,
            GioiTinh = request.GioiTinh,
            Role = VaiTro.User
        };

        var identityResult = await _userManager.CreateAsync(nguoiDung, request.MatKhau);
        if (!identityResult.Succeeded)
        {
            var errors = string.Join("; ", identityResult.Errors.Select(error => error.Description));
            return Result<AuthResponse>.Fail(errors);
        }

        return Result<AuthResponse>.Ok(TaoAuthResponse(nguoiDung));
    }

    public async Task<Result<AuthResponse>> DangNhapAsync(DangNhapRequest request)
    {
        await _dangNhapValidator.ValidateAndThrowAsync(request);

        // Code cũ xác minh BCrypt qua repository:
        // var nguoiDungCu = await _uow.NguoiDungs.GetByEmailAsync(email);
        // if (nguoiDungCu is null || nguoiDungCu.PasswordHash is null
        //     || !_hasher.Verify(request.MatKhau, nguoiDungCu.PasswordHash))
        //     return Result<AuthResponse>.Fail("Email hoặc mật khẩu không đúng.");

        // Cách mới: Identity tìm email đã chuẩn hóa và kiểm tra password hash.
        var email = request.Email.Trim().ToLowerInvariant();
        var nguoiDung = await _userManager.FindByEmailAsync(email);
        if (nguoiDung is null || !await _userManager.CheckPasswordAsync(nguoiDung, request.MatKhau))
            return Result<AuthResponse>.Fail("Email hoặc mật khẩu không đúng.");

        if (nguoiDung.TrangThai == TrangThaiNguoiDung.Khoa)
            return Result<AuthResponse>.Fail("Tài khoản đã bị khóa.");

        return Result<AuthResponse>.Ok(TaoAuthResponse(nguoiDung));
    }

    private AuthResponse TaoAuthResponse(NguoiDung nd) =>
        new(_jwt.TaoToken(nd), nd.Id, nd.HoTen, nd.Role.ToString());
}
