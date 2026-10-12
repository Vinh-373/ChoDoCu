using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Auth.DTOs;
using ChoDoCu.Application.Features.Auth.Interfaces;
using ChoDoCu.Domain.Constants;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Identity;

namespace ChoDoCu.Application.Features.Auth.Services;

public class AuthService : IAuthService
{
    private const string SaiThongTin = "Email hoặc mật khẩu không đúng.";

    private readonly IUnitOfWork _uow;
    private readonly UserManager<NguoiDung> _userManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager;
    private readonly IJwtService _jwt;
    private readonly IValidator<DangKyRequest> _dangKyValidator;
    private readonly IValidator<DangNhapRequest> _dangNhapValidator;

    public AuthService(
        IUnitOfWork uow,
        UserManager<NguoiDung> userManager,
        RoleManager<IdentityRole<int>> roleManager,
        IJwtService jwt,
        IValidator<DangKyRequest> dangKyValidator,
        IValidator<DangNhapRequest> dangNhapValidator)
    {
        _uow = uow;
        _userManager = userManager;
        _roleManager = roleManager;
        _jwt = jwt;
        _dangKyValidator = dangKyValidator;
        _dangNhapValidator = dangNhapValidator;
    }

    public async Task<Result<AuthResponse>> DangKyAsync(DangKyRequest request)
    {
        await _dangKyValidator.ValidateAndThrowAsync(request);

        var email = request.Email.Trim().ToLowerInvariant();
        var soDienThoai = request.SoDienThoai.Trim();

        if (await _userManager.FindByEmailAsync(email) is not null)
            return Result<AuthResponse>.Fail("Email đã được sử dụng.");

        if (await _uow.NguoiDungs.SoDienThoaiDaTonTaiAsync(soDienThoai))
            return Result<AuthResponse>.Fail("Số điện thoại đã được sử dụng.");

        var nguoiDung = new NguoiDung
        {
            UserName = email,
            Email = email,
            HoTen = request.HoTen.Trim(),
            SoDienThoai = soDienThoai,
            PhoneNumber = soDienThoai,
            NgaySinh = request.NgaySinh,
            GioiTinh = request.GioiTinh,
            TrangThai = TrangThaiNguoiDung.HoatDong,
            NgayTao = DateTime.Now
        };

        var created = await _userManager.CreateAsync(nguoiDung, request.MatKhau);
        if (!created.Succeeded)
            return Result<AuthResponse>.Fail(GopLoi(created));

        // Mọi tài khoản tự đăng ký đều là "User". Admin/Moderator chỉ được cấp bởi quản trị viên.
        var addRole = await _userManager.AddToRoleAsync(nguoiDung, AppRoles.User);
        if (!addRole.Succeeded)
        {
            // Không để lại tài khoản "mồ côi" không có Role.
            await _userManager.DeleteAsync(nguoiDung);
            return Result<AuthResponse>.Fail("Không thể gán vai trò cho tài khoản. Vui lòng thử lại.");
        }

        return Result<AuthResponse>.Ok(await TaoAuthResponseAsync(nguoiDung));
    }

    public async Task<Result<AuthResponse>> DangNhapAsync(DangNhapRequest request)
    {
        await _dangNhapValidator.ValidateAndThrowAsync(request);

        var email = request.Email.Trim().ToLowerInvariant();
        var nguoiDung = await _userManager.FindByEmailAsync(email);

        // Cùng một thông báo cho "không có email" và "sai mật khẩu" để không lộ email nào đã đăng ký.
        if (nguoiDung is null)
            return Result<AuthResponse>.Fail(SaiThongTin);

        if (await _userManager.IsLockedOutAsync(nguoiDung))
            return Result<AuthResponse>.Fail(ThongBaoBiKhoaTam(nguoiDung));

        if (!await _userManager.CheckPasswordAsync(nguoiDung, request.MatKhau))
        {
            // Đếm lần sai; vượt MaxFailedAccessAttempts (cấu hình ở Infrastructure) thì Identity tự khóa tạm.
            await _userManager.AccessFailedAsync(nguoiDung);

            return Result<AuthResponse>.Fail(
                await _userManager.IsLockedOutAsync(nguoiDung) ? ThongBaoBiKhoaTam(nguoiDung) : SaiThongTin);
        }

        // Chỉ báo "bị khóa" sau khi mật khẩu đúng, tránh dò trạng thái tài khoản bằng mật khẩu sai.
        if (nguoiDung.TrangThai == TrangThaiNguoiDung.Khoa)
            return Result<AuthResponse>.Fail("Tài khoản đã bị khóa.");

        await _userManager.ResetAccessFailedCountAsync(nguoiDung);

        return Result<AuthResponse>.Ok(await TaoAuthResponseAsync(nguoiDung));
    }

    private async Task<AuthResponse> TaoAuthResponseAsync(NguoiDung nd)
    {
        var roles = (await _userManager.GetRolesAsync(nd)).ToList();
        var permissions = await LayQuyenAsync(nd, roles);

        var token = _jwt.TaoToken(nd, roles, permissions);

        return new AuthResponse(
            token.Token,
            token.ExpiresAtUtc,
            nd.Id,
            nd.HoTen,
            nd.Email ?? string.Empty,
            roles.FirstOrDefault() ?? AppRoles.User,
            roles,
            permissions);
    }

    /// <summary>
    /// Quyền = claim "permission" của các Role (AspNetRoleClaims) + claim "permission" gán riêng cho user (AspNetUserClaims).
    /// </summary>
    private async Task<List<string>> LayQuyenAsync(NguoiDung nd, IEnumerable<string> roles)
    {
        var permissions = new HashSet<string>();

        foreach (var roleName in roles)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role is null) continue;

            foreach (var c in await _roleManager.GetClaimsAsync(role))
                if (c.Type == AppPermissions.ClaimType) permissions.Add(c.Value);
        }

        foreach (var c in await _userManager.GetClaimsAsync(nd))
            if (c.Type == AppPermissions.ClaimType) permissions.Add(c.Value);

        return permissions.OrderBy(x => x).ToList();
    }

    private static string GopLoi(IdentityResult result) =>
        string.Join("; ", result.Errors.Select(e => e.Description));

    private static string ThongBaoBiKhoaTam(NguoiDung nd)
    {
        var conLai = nd.LockoutEnd is { } end ? end - DateTimeOffset.UtcNow : TimeSpan.Zero;
        var phut = Math.Max(1, (int)Math.Ceiling(conLai.TotalMinutes));
        return $"Đăng nhập sai quá nhiều lần. Tài khoản tạm khóa, vui lòng thử lại sau {phut} phút.";
    }
}
