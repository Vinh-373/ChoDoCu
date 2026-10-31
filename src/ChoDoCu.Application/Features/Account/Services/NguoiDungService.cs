using System.Text.RegularExpressions;
using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Account.DTOs;
using ChoDoCu.Application.Features.Account.Interfaces;
using ChoDoCu.Domain.Constants;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace ChoDoCu.Application.Features.Account.Services;

public class NguoiDungService : INguoiDungService
{
    private static readonly Regex SoDienThoaiHopLe = new(@"^(0|\+84)\d{9}$", RegexOptions.Compiled);

    private readonly IUnitOfWork _uow;
    private readonly UserManager<NguoiDung> _userManager;
    private readonly IValidator<CapNhatHoSoRequest> _capNhatValidator;
    private readonly IEmailService _email;
    private readonly ILogger<NguoiDungService> _logger;

    public NguoiDungService(
        IUnitOfWork uow,
        UserManager<NguoiDung> userManager,
        IValidator<CapNhatHoSoRequest> capNhatValidator,
        IEmailService email,
        ILogger<NguoiDungService> logger)
    {
        _uow = uow;
        _userManager = userManager;
        _capNhatValidator = capNhatValidator;
        _email = email;
        _logger = logger;
    }

    // ================= Hồ sơ cá nhân =================

    public async Task<HoSoResponse> GetHoSoAsync(int idNguoiDung)
    {
        var nd = await _uow.NguoiDungs.GetKemDiaChiAsync(idNguoiDung)
            ?? throw new NotFoundException(nameof(NguoiDung), idNguoiDung);

        var roles = (await _uow.NguoiDungs.LayRolesAsync(new[] { idNguoiDung }))
            .GetValueOrDefault(idNguoiDung) ?? new List<string>();

        return new HoSoResponse(
            nd.Id, nd.HoTen, nd.Email ?? string.Empty, nd.SoDienThoai, nd.NgaySinh, nd.GioiTinh,
            nd.AnhNguoiDung,
            nd.IdThanhPho, nd.ThanhPho?.TenThanhPho,
            nd.IdPhuongXa, nd.PhuongXa?.TenPhuongXa,
            nd.LuotDang, nd.LuotDay, nd.NgayTao, nd.TrangThai.ToString(), roles,
            nd.TenGianHang, nd.DiaChiChiTiet, nd.GioiThieu);
    }

    public async Task<HoSoResponse> CapNhatHoSoAsync(int idNguoiDung, CapNhatHoSoRequest request)
    {
        await _capNhatValidator.ValidateAndThrowAsync(request);

        var nd = await _userManager.FindByIdAsync(idNguoiDung.ToString())
            ?? throw new NotFoundException(nameof(NguoiDung), idNguoiDung);

        // Số điện thoại KHÔNG đổi qua API này: muốn đổi phải xác nhận bằng mã gửi qua email
        // (YeuCauDoiSoDienThoaiAsync / XacNhanDoiSoDienThoaiAsync). Nếu tài khoản chưa có số (đăng nhập Google)
        // thì cho điền lần đầu, vẫn kiểm tra trùng.
        var soDienThoai = request.SoDienThoai?.Trim();
        if (string.IsNullOrEmpty(nd.SoDienThoai) && !string.IsNullOrEmpty(soDienThoai))
        {
            if (await _uow.NguoiDungs.SoDienThoaiDaDuocNguoiKhacDungAsync(soDienThoai, idNguoiDung))
                throw new DomainException("Số điện thoại đã được sử dụng.");

            nd.SoDienThoai = soDienThoai;
            nd.PhoneNumber = soDienThoai;
        }

        await KiemTraDiaChiAsync(request.IdThanhPho, request.IdPhuongXa);

        nd.HoTen = request.HoTen.Trim();
        if (request.NgaySinh is { } ngaySinh) nd.NgaySinh = ngaySinh;
        if (!string.IsNullOrWhiteSpace(request.GioiTinh)) nd.GioiTinh = request.GioiTinh.Trim();
        if (request.AnhNguoiDung is not null)
            nd.AnhNguoiDung = string.IsNullOrWhiteSpace(request.AnhNguoiDung) ? null : request.AnhNguoiDung.Trim();
        nd.IdThanhPho = request.IdThanhPho;
        nd.IdPhuongXa = request.IdPhuongXa;
        nd.TenGianHang = string.IsNullOrWhiteSpace(request.TenGianHang) ? null : request.TenGianHang.Trim();
        nd.DiaChiChiTiet = string.IsNullOrWhiteSpace(request.DiaChiChiTiet) ? null : request.DiaChiChiTiet.Trim();
        nd.GioiThieu = string.IsNullOrWhiteSpace(request.GioiThieu) ? null : request.GioiThieu.Trim();

        var result = await _userManager.UpdateAsync(nd);
        if (!result.Succeeded)
            throw new DomainException(string.Join("; ", result.Errors.Select(e => e.Description)));

        return await GetHoSoAsync(idNguoiDung);
    }

    // ================= Đổi số điện thoại bằng mã gửi qua email =================

    public async Task YeuCauDoiSoDienThoaiAsync(int idNguoiDung, YeuCauDoiSoDienThoaiRequest request)
    {
        var soMoi = ChuanHoaSoDienThoai(request.SoDienThoaiMoi);

        var nd = await _userManager.FindByIdAsync(idNguoiDung.ToString())
            ?? throw new NotFoundException(nameof(NguoiDung), idNguoiDung);

        if (string.IsNullOrWhiteSpace(nd.Email))
            throw new DomainException("Tài khoản chưa có email để nhận mã xác nhận.");
        if (soMoi == nd.SoDienThoai)
            throw new DomainException("Số điện thoại mới trùng với số hiện tại.");
        if (await _uow.NguoiDungs.SoDienThoaiDaDuocNguoiKhacDungAsync(soMoi, idNguoiDung))
            throw new DomainException("Số điện thoại đã được sử dụng.");

        // Mã 6 chữ số gắn với số mới và tài khoản này (Identity: PhoneNumberTokenProvider), hết hạn sau vài phút.
        var ma = await _userManager.GenerateChangePhoneNumberTokenAsync(nd, soMoi);

        try
        {
            await _email.GuiMaDoiSoDienThoaiAsync(nd.Email, nd.HoTen, soMoi, ma);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Không gửi được email mã đổi số điện thoại cho người dùng {IdNguoiDung}.", idNguoiDung);
            throw new DomainException("Không gửi được email xác nhận. Vui lòng thử lại sau.");
        }
    }

    public async Task<HoSoResponse> XacNhanDoiSoDienThoaiAsync(int idNguoiDung, XacNhanDoiSoDienThoaiRequest request)
    {
        var soMoi = ChuanHoaSoDienThoai(request.SoDienThoaiMoi);
        var ma = request.MaXacNhan?.Trim();
        if (string.IsNullOrEmpty(ma))
            throw new DomainException("Vui lòng nhập mã xác nhận.");

        var nd = await _userManager.FindByIdAsync(idNguoiDung.ToString())
            ?? throw new NotFoundException(nameof(NguoiDung), idNguoiDung);

        if (!await _userManager.VerifyChangePhoneNumberTokenAsync(nd, ma, soMoi))
            throw new DomainException("Mã xác nhận không đúng hoặc đã hết hạn.");

        // Kiểm tra lại: trong lúc chờ mã, người khác có thể đã dùng số này.
        if (await _uow.NguoiDungs.SoDienThoaiDaDuocNguoiKhacDungAsync(soMoi, idNguoiDung))
            throw new DomainException("Số điện thoại đã được sử dụng.");

        nd.SoDienThoai = soMoi;
        nd.PhoneNumber = soMoi;
        nd.PhoneNumberConfirmed = true;

        var result = await _userManager.UpdateAsync(nd);
        if (!result.Succeeded)
            throw new DomainException(string.Join("; ", result.Errors.Select(e => e.Description)));

        return await GetHoSoAsync(idNguoiDung);
    }

    private static string ChuanHoaSoDienThoai(string? value)
    {
        var so = (value ?? string.Empty).Replace(" ", string.Empty).Trim();
        if (!SoDienThoaiHopLe.IsMatch(so))
            throw new DomainException("Số điện thoại không hợp lệ.");
        return so;
    }

    private async Task KiemTraDiaChiAsync(int? idThanhPho, int? idPhuongXa)
    {
        if (idThanhPho is null)
        {
            if (idPhuongXa is not null)
                throw new DomainException("Phải chọn thành phố trước khi chọn phường/xã.");
            return;
        }

        _ = await _uow.ThanhPhos.GetByIdAsync(idThanhPho.Value)
            ?? throw new NotFoundException(nameof(ThanhPho), idThanhPho.Value);

        if (idPhuongXa is null) return;

        var phuongXa = await _uow.PhuongXas.GetByIdAsync(idPhuongXa.Value)
            ?? throw new NotFoundException(nameof(PhuongXa), idPhuongXa.Value);

        if (phuongXa.IdThanhPho != idThanhPho.Value)
            throw new DomainException("Phường/xã không thuộc thành phố đã chọn.");
    }

    // ================= Quản trị =================

    public async Task<PagedResult<NguoiDungListItem>> DanhSachAsync(
        string? keyword, string? trangThai, string? role, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        TrangThaiNguoiDung? trangThaiLoc = null;
        if (!string.IsNullOrWhiteSpace(trangThai))
        {
            if (!Enum.TryParse<TrangThaiNguoiDung>(trangThai.Trim(), ignoreCase: true, out var parsed))
                throw new DomainException("Trạng thái phải là HoatDong hoặc Khoa.");
            trangThaiLoc = parsed;
        }

        var roleLoc = string.IsNullOrWhiteSpace(role) ? null : role.Trim();
        var tuKhoa = string.IsNullOrWhiteSpace(keyword) ? null : keyword.Trim();

        var (items, total) = await _uow.NguoiDungs.TimKiemAsync(tuKhoa, trangThaiLoc, roleLoc, page, pageSize);
        var roles = await _uow.NguoiDungs.LayRolesAsync(items.Select(x => x.Id));

        var mapped = items.Select(x => new NguoiDungListItem(
            x.Id, x.HoTen, x.Email ?? string.Empty, x.SoDienThoai, x.GioiTinh, x.AnhNguoiDung,
            x.TrangThai.ToString(), x.NgayTao, x.LuotDang,
            x.LockoutEnd is { } end && end > DateTimeOffset.UtcNow ? end : null,
            roles.GetValueOrDefault(x.Id) ?? new List<string>())).ToList();

        return new PagedResult<NguoiDungListItem>(mapped, total, page, pageSize);
    }

    public async Task KhoaAsync(int idAdmin, int idNguoiDung)
    {
        if (idAdmin == idNguoiDung)
            throw new DomainException("Bạn không thể tự khóa tài khoản của mình.");

        var nd = await _userManager.FindByIdAsync(idNguoiDung.ToString())
            ?? throw new NotFoundException(nameof(NguoiDung), idNguoiDung);

        if (await _userManager.IsInRoleAsync(nd, AppRoles.Admin))
            throw new DomainException("Không thể khóa tài khoản Admin.");

        if (nd.TrangThai == TrangThaiNguoiDung.Khoa) return;   // đã khóa rồi

        nd.TrangThai = TrangThaiNguoiDung.Khoa;
        var result = await _userManager.UpdateAsync(nd);
        if (!result.Succeeded)
            throw new DomainException(string.Join("; ", result.Errors.Select(e => e.Description)));

        // Đổi SecurityStamp để vô hiệu các cookie/token Identity khác dựa trên stamp.
        await _userManager.UpdateSecurityStampAsync(nd);
    }

    public async Task MoKhoaAsync(int idNguoiDung)
    {
        var nd = await _userManager.FindByIdAsync(idNguoiDung.ToString())
            ?? throw new NotFoundException(nameof(NguoiDung), idNguoiDung);

        nd.TrangThai = TrangThaiNguoiDung.HoatDong;
        var result = await _userManager.UpdateAsync(nd);
        if (!result.Succeeded)
            throw new DomainException(string.Join("; ", result.Errors.Select(e => e.Description)));

        // Xóa luôn khóa tạm do đăng nhập sai để người dùng vào lại được ngay.
        await _userManager.SetLockoutEndDateAsync(nd, null);
        await _userManager.ResetAccessFailedCountAsync(nd);
    }
}
