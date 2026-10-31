using ChoDoCu.Application.Features.Category.DTOs;
using ChoDoCu.Application.Features.Category.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;

namespace ChoDoCu.Application.Features.Category.Services;

public class DanhMucService : IDanhMucService
{
    private readonly IUnitOfWork _uow;
    private readonly IValidator<TaoDanhMucRequest> _taoValidator;
    private readonly IValidator<CapNhatDanhMucRequest> _capNhatValidator;

    public DanhMucService(
        IUnitOfWork uow,
        IValidator<TaoDanhMucRequest> taoValidator,
        IValidator<CapNhatDanhMucRequest> capNhatValidator)
    {
        _uow = uow;
        _taoValidator = taoValidator;
        _capNhatValidator = capNhatValidator;
    }

    public async Task<List<DanhMucResponse>> GetCayDanhMucAsync()
    {
        var goc = await _uow.DanhMucs.GetCayDanhMucAsync();
        return goc.Select(ToResponse).ToList();
    }

    public async Task<List<ThuocTinhDanhMucResponse>> GetThuocTinhDanhMucAsync(int idDanhMuc, int? idHang)
    {
        _ = await _uow.DanhMucs.GetByIdAsync(idDanhMuc)
            ?? throw new NotFoundException(nameof(Domain.Entities.DanhMuc), idDanhMuc);

        var thuocTinhs = await _uow.DanhMucs.GetThuocTinhDanhMucAsync(idDanhMuc);
        var idThuocTinhHang = thuocTinhs
            .FirstOrDefault(x => x.TenThuocTinh == "Hãng xe")?.Id;
        var hangs = idThuocTinhHang.HasValue
            ? await _uow.DanhMucs.GetHangsDanhMucAsync(idDanhMuc)
            : Array.Empty<Hang>();
        var dongSanPhams = idThuocTinhHang.HasValue
            && thuocTinhs.Any(x => x.IdThuocTinhCha == idThuocTinhHang)
            ? await _uow.DanhMucs.GetDongSanPhamsDanhMucAsync(idDanhMuc, idHang)
            : Array.Empty<DongSanPham>();

        return thuocTinhs.Select(thuocTinh =>
        {
            IReadOnlyList<ThuocTinhLuaChonResponse> luaChons = thuocTinh.Id == idThuocTinhHang
                ? hangs.Select(x => new ThuocTinhLuaChonResponse(
                    x.Id.ToString(), x.TenHang ?? string.Empty)).ToList()
                : idThuocTinhHang.HasValue && thuocTinh.IdThuocTinhCha == idThuocTinhHang
                    ? dongSanPhams.Select(x => new ThuocTinhLuaChonResponse(
                        x.Id.ToString(), x.TenDongSanPham ?? string.Empty, x.IdHang)).ToList()
                    : thuocTinh.DanhSachGiaTriLuaChon
                        .Select(x => new ThuocTinhLuaChonResponse(x, x))
                        .ToList();

            return new ThuocTinhDanhMucResponse(
                thuocTinh.Id,
                thuocTinh.TenThuocTinh,
                thuocTinh.KieuDuLieu.ToString(),
                thuocTinh.BatBuoc,
                luaChons,
                thuocTinh.ThuTu,
                thuocTinh.IdThuocTinhCha);
        }).ToList();
    }

    public async Task<DanhMucResponse> TaoAsync(TaoDanhMucRequest request)
    {
        await _taoValidator.ValidateAndThrowAsync(request);

        if (request.IdDanhMucCha.HasValue)
            _ = await _uow.DanhMucs.GetByIdAsync(request.IdDanhMucCha.Value)
                ?? throw new NotFoundException(nameof(Domain.Entities.DanhMuc), request.IdDanhMucCha.Value);

        var danhMuc = new Domain.Entities.DanhMuc
        {
            IdDanhMucCha = request.IdDanhMucCha,
            TenDanhMuc = request.TenDanhMuc.Trim(),
            AnhDanhMuc = request.AnhDanhMuc
        };

        await _uow.DanhMucs.AddAsync(danhMuc);
        await _uow.SaveChangesAsync();

        return ToResponse(danhMuc);
    }

    public async Task<DanhMucResponse> CapNhatAsync(int id, CapNhatDanhMucRequest request)
    {
        await _capNhatValidator.ValidateAndThrowAsync(request);

        var danhMuc = await _uow.DanhMucs.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Domain.Entities.DanhMuc), id);

        danhMuc.TenDanhMuc = request.TenDanhMuc.Trim();
        danhMuc.AnhDanhMuc = request.AnhDanhMuc;
        danhMuc.TrangThai = request.TrangThai;

        await _uow.SaveChangesAsync();
        return ToResponse(danhMuc);
    }

    public async Task XoaAsync(int id)
    {
        var danhMuc = await _uow.DanhMucs.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Domain.Entities.DanhMuc), id);

        if (await _uow.DanhMucs.CoDanhMucConAsync(id))
            throw new DomainException("Không thể xóa danh mục đang có danh mục con.");

        _uow.DanhMucs.Remove(danhMuc);
        await _uow.SaveChangesAsync();
    }

    private static DanhMucResponse ToResponse(Domain.Entities.DanhMuc d) => new(
        d.Id, d.IdDanhMucCha, d.TenDanhMuc, d.AnhDanhMuc, d.TrangThai,
        d.DanhMucCons.Select(ToResponse).ToList());
}
