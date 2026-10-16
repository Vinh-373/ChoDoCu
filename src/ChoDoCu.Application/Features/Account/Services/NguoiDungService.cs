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

namespace ChoDoCu.Application.Features.Account.Services;

public class NguoiDungService : INguoiDungService
{
    private readonly IUnitOfWork _uow;
    private readonly UserManager<NguoiDung> _userManager;
    private readonly IValidator<CapNhatHoSoRequest> _capNhatValidator;

    public NguoiDungService(
        IUnitOfWork uow,
        UserManager<NguoiDung> userManager,
        IValidator<CapNhatHoSoRequest> capNhatValidator)
    {
        _uow = uow;
        _userManager = userManager;
        _capNhatValidator = capNhatValidator;
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
            nd.LuotDang, nd.LuotDay, nd.NgayTao, nd.TrangThai.ToString(), roles);
    }

    public async Task<HoSoResponse> CapNhatHoSoAsync(int idNguoiDung, CapNhatHoSoRequest request)
    {
        await _capNhatValidator.ValidateAndThrowAsync(request);

        var nd = await _userManager.FindByIdAsync(idNguoiDung.ToString())
            ?? throw new NotFoundException(nameof(NguoiDung), idNguoiDung);

        var soDienThoai = request.SoDienThoai.Trim();
        if (await _uow.NguoiDungs.SoDienThoaiDaDuocNguoiKhacDungAsync(soDienThoai, idNguoiDung))
            throw new DomainException("Số điện thoại đã được sử dụng.");

        await KiemTraDiaChiAsync(request.IdThanhPho, request.IdPhuongXa);

        nd.HoTen = request.HoTen.Trim();
        nd.SoDienThoai = soDienThoai;
        nd.PhoneNumber = soDienThoai;
        nd.NgaySinh = request.NgaySinh;
        nd.GioiTinh = request.GioiTinh;
        nd.AnhNguoiDung = string.IsNullOrWhiteSpace(request.AnhNguoiDung) ? null : request.AnhNguoiDung.Trim();
        nd.IdThanhPho = request.IdThanhPho;
        nd.IdPhuongXa = request.IdPhuongXa;

        var result = await _userManager.UpdateAsync(nd);
        if (!result.Succeeded)
            throw new DomainException(string.Join("; ", result.Errors.Select(e => e.Description)));

        return await GetHoSoAsync(idNguoiDung);
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
