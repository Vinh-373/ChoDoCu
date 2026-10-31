using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Auth.DTOs;
using ChoDoCu.Application.Features.Auth.Interfaces;
using ChoDoCu.Domain.Constants;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;
using System.Collections.Concurrent;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace ChoDoCu.Application.Features.Auth.Services;

public class AuthService : IAuthService
{
    private const string GoogleProvider = "Google";
    private const string SaiThongTin = "Email hoặc mật khẩu không đúng.";

    private readonly IUnitOfWork _uow;
    private readonly UserManager<NguoiDung> _userManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager;
    private readonly IJwtService _jwt;
    private readonly IValidator<DangKyRequest> _dangKyValidator;
    private readonly IValidator<DangNhapRequest> _dangNhapValidator;
    private readonly IValidator<DoiMatKhauRequest> _doiMatKhauValidator;
    private readonly IValidator<QuenMatKhauRequest> _quenMatKhauValidator;
    private readonly IValidator<DatLaiMatKhauRequest> _datLaiMatKhauValidator;
    private readonly IEmailService _email;
    private readonly IGoogleTokenVerifier _google;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUnitOfWork uow,
        UserManager<NguoiDung> userManager,
        RoleManager<IdentityRole<int>> roleManager,
        IJwtService jwt,
        IValidator<DangKyRequest> dangKyValidator,
        IValidator<DangNhapRequest> dangNhapValidator,
        IValidator<DoiMatKhauRequest> doiMatKhauValidator,
        IValidator<QuenMatKhauRequest> quenMatKhauValidator,
        IValidator<DatLaiMatKhauRequest> datLaiMatKhauValidator,
        IEmailService email,
        IGoogleTokenVerifier google,
        ILogger<AuthService> logger)
    {
        _uow = uow;
        _userManager = userManager;
        _roleManager = roleManager;
        _jwt = jwt;
        _dangKyValidator = dangKyValidator;
        _dangNhapValidator = dangNhapValidator;
        _doiMatKhauValidator = doiMatKhauValidator;
        _quenMatKhauValidator = quenMatKhauValidator;
        _datLaiMatKhauValidator = datLaiMatKhauValidator;
        _email = email;
        _google = google;
        _logger = logger;
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

    public async Task<Result<AuthResponse>> DangNhapGoogleAsync(DangNhapGoogleRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
            return Result<AuthResponse>.Fail("Thiếu mã xác thực Google.");

        // Google ký idToken; verifier kiểm tra chữ ký, hạn dùng và audience = ClientId của ứng dụng.
        var info = await _google.XacThucAsync(request.IdToken);
        if (info is null || !info.EmailVerified || string.IsNullOrWhiteSpace(info.Email))
            return Result<AuthResponse>.Fail("Không xác thực được tài khoản Google.");

        var email = info.Email.Trim().ToLowerInvariant();

        // 1) Đã từng đăng nhập Google → tìm theo (Google, sub) trong AspNetUserLogins.
        var nguoiDung = await _userManager.FindByLoginAsync(GoogleProvider, info.Subject);

        if (nguoiDung is null)
        {
            // 2) Chưa liên kết → dùng tài khoản cùng email (Google đã xác minh email), nếu chưa có thì tạo mới.
            nguoiDung = await _userManager.FindByEmailAsync(email);

            if (nguoiDung is null)
            {
                nguoiDung = new NguoiDung
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                    HoTen = string.IsNullOrWhiteSpace(info.Name) ? email.Split('@')[0] : info.Name.Trim(),
                    // Google không cung cấp các trường dưới đây; người dùng bổ sung ở trang hồ sơ.
                    SoDienThoai = string.Empty,
                    NgaySinh = new DateTime(1900, 1, 1), // tạm, FE hiển thị như chưa nhập
                    GioiTinh = "Chưa XĐ",       // người dùng chọn lại ở trang hồ sơ
                    TrangThai = TrangThaiNguoiDung.HoatDong,
                    NgayTao = DateTime.Now
                };

                var created = await _userManager.CreateAsync(nguoiDung); // không mật khẩu
                if (!created.Succeeded)
                    return Result<AuthResponse>.Fail(GopLoi(created));

                var addRole = await _userManager.AddToRoleAsync(nguoiDung, AppRoles.User);
                if (!addRole.Succeeded)
                {
                    await _userManager.DeleteAsync(nguoiDung);
                    return Result<AuthResponse>.Fail("Không thể gán vai trò cho tài khoản. Vui lòng thử lại.");
                }
            }

            var linked = await _userManager.AddLoginAsync(nguoiDung, new UserLoginInfo(GoogleProvider, info.Subject, GoogleProvider));
            if (!linked.Succeeded)
                return Result<AuthResponse>.Fail(GopLoi(linked));
        }

        if (nguoiDung.TrangThai == TrangThaiNguoiDung.Khoa)
            return Result<AuthResponse>.Fail("Tài khoản đã bị khóa.");

        if (await _userManager.IsLockedOutAsync(nguoiDung))
            return Result<AuthResponse>.Fail(ThongBaoBiKhoaTam(nguoiDung));

        return Result<AuthResponse>.Ok(await TaoAuthResponseAsync(nguoiDung));
    }

    public async Task<Result<bool>> DoiMatKhauAsync(int idNguoiDung, DoiMatKhauRequest request)
    {
        await _doiMatKhauValidator.ValidateAndThrowAsync(request);

        var nguoiDung = await _userManager.FindByIdAsync(idNguoiDung.ToString())
            ?? throw new NotFoundException(nameof(NguoiDung), idNguoiDung);

        var result = await _userManager.ChangePasswordAsync(nguoiDung, request.MatKhauCu, request.MatKhauMoi);
        if (!result.Succeeded)
        {
            return Result<bool>.Fail(
                result.Errors.Any(e => e.Code == nameof(IdentityErrorDescriber.PasswordMismatch))
                    ? "Mật khẩu hiện tại không đúng."
                    : GopLoi(result));
        }

        return Result<bool>.Ok(true);
    }

    // ================= Quên mật khẩu bằng mã 6 số gửi qua email =================
    // Mã do Identity (EmailTokenProvider, kiểu TOTP) tính từ SecurityStamp + email + thời gian nên không lưu ở đâu cả;
    // đổi mật khẩu xong thì SecurityStamp đổi và mã cũ tự mất hiệu lực.

    private const string MucDichMaDatLai = "DatLaiMatKhau";
    private const int SoLanNhapMaToiDa = 5;
    private static readonly TimeSpan ThoiGianKhoaNhapMa = TimeSpan.FromMinutes(15);
    // Đếm số lần nhập sai mã theo email (trong bộ nhớ của tiến trình; chạy nhiều instance thì chuyển sang cache dùng chung).
    private static readonly ConcurrentDictionary<string, (int SoLan, DateTime HetHan)> NhapSaiMa = new();

    private static bool DaNhapSaiQuaNhieu(string email) =>
        NhapSaiMa.TryGetValue(email, out var v) && v.HetHan > DateTime.UtcNow && v.SoLan >= SoLanNhapMaToiDa;

    private static void GhiNhanNhapSai(string email) =>
        NhapSaiMa.AddOrUpdate(
            email,
            _ => (1, DateTime.UtcNow.Add(ThoiGianKhoaNhapMa)),
            (_, cu) => cu.HetHan <= DateTime.UtcNow ? (1, DateTime.UtcNow.Add(ThoiGianKhoaNhapMa)) : (cu.SoLan + 1, cu.HetHan));

    public async Task QuenMatKhauAsync(QuenMatKhauRequest request)
    {
        await _quenMatKhauValidator.ValidateAndThrowAsync(request);

        var email = request.Email.Trim().ToLowerInvariant();
        var nguoiDung = await _userManager.FindByEmailAsync(email);

        // Không có tài khoản hoặc đang bị khóa: im lặng, không cho người ngoài biết.
        if (nguoiDung is null || nguoiDung.TrangThai == TrangThaiNguoiDung.Khoa)
            return;

        var ma = await _userManager.GenerateUserTokenAsync(nguoiDung, TokenOptions.DefaultEmailProvider, MucDichMaDatLai);
        NhapSaiMa.TryRemove(email, out _);

        try
        {
            // Tham số thứ 3 của GuiDatLaiMatKhauAsync giờ là mã 6 số (trước đây là token trong liên kết).
            await _email.GuiDatLaiMatKhauAsync(email, nguoiDung.HoTen, ma);
        }
        catch (Exception ex)
        {
            // Lỗi SMTP chỉ ghi log; trả lỗi ra ngoài sẽ làm lộ việc email này có tồn tại.
            _logger.LogError(ex, "Không gửi được email mã đặt lại mật khẩu cho người dùng {IdNguoiDung}.", nguoiDung.Id);
        }
    }

    /// <summary>Kiểm tra mã 6 số (bước 2 của màn hình quên mật khẩu), chưa đổi mật khẩu.</summary>
    public async Task<Result<bool>> XacNhanMaDatLaiAsync(XacNhanMaDatLaiRequest request)
    {
        var (nguoiDung, loi) = await TimNguoiDungVaKiemTraMaAsync(request.Email, request.MaXacNhan);
        return nguoiDung is null ? Result<bool>.Fail(loi!) : Result<bool>.Ok(true);
    }

    /// <summary>Đặt mật khẩu mới. DatLaiMatKhauRequest.Token chính là mã 6 số nhận qua email.</summary>
    public async Task<Result<bool>> DatLaiMatKhauAsync(DatLaiMatKhauRequest request)
    {
        await _datLaiMatKhauValidator.ValidateAndThrowAsync(request);

        var (nguoiDung, loi) = await TimNguoiDungVaKiemTraMaAsync(request.Email, request.MaOTP);
        if (nguoiDung is null)
            return Result<bool>.Fail(loi!);

        // Mã đúng -> tạo token nội bộ của Identity để đặt mật khẩu (client không cần giữ token này).
        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(nguoiDung);
        var result = await _userManager.ResetPasswordAsync(nguoiDung, resetToken, request.MatKhauMoi);
        if (!result.Succeeded)
            return Result<bool>.Fail(GopLoi(result));

        NhapSaiMa.TryRemove(nguoiDung.Email!.ToLowerInvariant(), out _);

        // Đặt lại mật khẩu xong thì cho đăng nhập lại ngay, kể cả khi đang bị khóa tạm do nhập sai.
        await _userManager.SetLockoutEndDateAsync(nguoiDung, null);
        await _userManager.ResetAccessFailedCountAsync(nguoiDung);

        return Result<bool>.Ok(true);
    }

    private async Task<(NguoiDung? NguoiDung, string? Loi)> TimNguoiDungVaKiemTraMaAsync(string? emailRaw, string? maRaw)
    {
        const string MaKhongHopLe = "Mã xác nhận không đúng hoặc đã hết hạn.";

        var email = (emailRaw ?? string.Empty).Trim().ToLowerInvariant();
        var ma = (maRaw ?? string.Empty).Trim();

        if (DaNhapSaiQuaNhieu(email))
            return (null, "Bạn đã nhập sai mã quá nhiều lần. Vui lòng thử lại sau 15 phút hoặc yêu cầu mã mới.");

        var nguoiDung = await _userManager.FindByEmailAsync(email);
        if (nguoiDung is null || nguoiDung.TrangThai == TrangThaiNguoiDung.Khoa)
        {
            GhiNhanNhapSai(email);
            return (null, MaKhongHopLe);
        }

        var hopLe = ma.Length == 6 &&
            await _userManager.VerifyUserTokenAsync(nguoiDung, TokenOptions.DefaultEmailProvider, MucDichMaDatLai, ma);
        if (!hopLe)
        {
            GhiNhanNhapSai(email);
            return (null, MaKhongHopLe);
        }

        return (nguoiDung, null);
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
