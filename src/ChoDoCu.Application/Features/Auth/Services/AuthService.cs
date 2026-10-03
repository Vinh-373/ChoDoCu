using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Auth.DTOs;
using ChoDoCu.Application.Features.Auth.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;

namespace ChoDoCu.Application.Features.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtService _jwt;
    private readonly IValidator<DangKyRequest> _dangKyValidator;
    private readonly IValidator<DangNhapRequest> _dangNhapValidator;

    public AuthService(
        IUnitOfWork uow,
        IPasswordHasher hasher,
        IJwtService jwt,
        IValidator<DangKyRequest> dangKyValidator,
        IValidator<DangNhapRequest> dangNhapValidator)
    {
        _uow = uow;
        _hasher = hasher;
        _jwt = jwt;
        _dangKyValidator = dangKyValidator;
        _dangNhapValidator = dangNhapValidator;
    }

    public async Task<Result<AuthResponse>> DangKyAsync(DangKyRequest request)
    {
        // 1. Kiểm tra dữ liệu đầu vào (lỗi -> ValidationException -> middleware trả 400)
        await _dangKyValidator.ValidateAndThrowAsync(request);

        // 2. Kiểm tra trùng
        if (await _uow.NguoiDungs.EmailDaTonTaiAsync(request.Email))
            return Result<AuthResponse>.Fail("Email đã được sử dụng.");
        if (await _uow.NguoiDungs.SoDienThoaiDaTonTaiAsync(request.SoDienThoai))
            return Result<AuthResponse>.Fail("Số điện thoại đã được sử dụng.");

        // 3. Tạo entity (băm mật khẩu, không lưu thô)
        var nguoiDung = new NguoiDung
        {
            HoTen = request.HoTen.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            SoDienThoai = request.SoDienThoai,
            NgaySinh = request.NgaySinh,
            GioiTinh = request.GioiTinh,
            PasswordHash = _hasher.Hash(request.MatKhau),
            Role = VaiTro.User
        };

        await _uow.NguoiDungs.AddAsync(nguoiDung);
        await _uow.SaveChangesAsync();

        return Result<AuthResponse>.Ok(TaoAuthResponse(nguoiDung));
    }

    public async Task<Result<AuthResponse>> DangNhapAsync(DangNhapRequest request)
    {
        await _dangNhapValidator.ValidateAndThrowAsync(request);

        var nguoiDung = await _uow.NguoiDungs.GetByEmailAsync(request.Email.Trim().ToLowerInvariant());

        // Cùng một thông báo cho cả "không có email" và "sai mật khẩu" để tránh lộ thông tin
        if (nguoiDung is null || nguoiDung.PasswordHash is null
            || !_hasher.Verify(request.MatKhau, nguoiDung.PasswordHash))
            return Result<AuthResponse>.Fail("Email hoặc mật khẩu không đúng.");

        if (nguoiDung.TrangThai == TrangThaiNguoiDung.Khoa)
            return Result<AuthResponse>.Fail("Tài khoản đã bị khóa.");

        return Result<AuthResponse>.Ok(TaoAuthResponse(nguoiDung));
    }

    private AuthResponse TaoAuthResponse(NguoiDung nd) =>
        new(_jwt.TaoToken(nd), nd.Id, nd.HoTen, nd.Role.ToString());
}
