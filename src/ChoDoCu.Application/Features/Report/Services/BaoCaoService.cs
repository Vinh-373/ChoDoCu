using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Report.DTOs;
using ChoDoCu.Application.Features.Report.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;

namespace ChoDoCu.Application.Features.Report.Services;

public class BaoCaoService : IBaoCaoService
{
    private readonly IUnitOfWork _uow;
    private readonly IValidator<TaoBaoCaoRequest> _validator;

    public BaoCaoService(IUnitOfWork uow, IValidator<TaoBaoCaoRequest> validator)
    {
        _uow = uow;
        _validator = validator;
    }

    public async Task<BaoCaoResponse> TaoAsync(int idNguoiDung, TaoBaoCaoRequest request)
    {
        await _validator.ValidateAndThrowAsync(request);

        _ = await _uow.BaiDangs.GetByIdAsync(request.IdBaiDang)
            ?? throw new NotFoundException(nameof(BaiDang), request.IdBaiDang);

        var baoCao = new BaoCao
        {
            IdNguoiDung = idNguoiDung,
            IdBaiDang = request.IdBaiDang,
            NoiDung = request.NoiDung
        };

        await _uow.BaoCaos.AddAsync(baoCao);
        await _uow.SaveChangesAsync();

        var chiTiet = await _uow.BaoCaos.GetChiTietAsync(baoCao.Id);
        return ToResponse(chiTiet!);
    }

    public async Task<PagedResult<BaoCaoResponse>> DanhSachAsync(string? trangThai, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var (items, total) = await _uow.BaoCaos.DanhSachAsync(trangThai, page, pageSize);
        return new PagedResult<BaoCaoResponse>(items.Select(ToResponse).ToList(), total, page, pageSize);
    }

    public async Task XuLyAsync(int id, string trangThaiMoi)
    {
        var baoCao = await _uow.BaoCaos.GetByIdAsync(id) ?? throw new NotFoundException(nameof(BaoCao), id);
        baoCao.TrangThai = trangThaiMoi;
        await _uow.SaveChangesAsync();
    }

    private static BaoCaoResponse ToResponse(BaoCao b) => new(
        b.Id, b.IdBaiDang, b.BaiDang.TieuDe, b.IdNguoiDung, b.NguoiDung.HoTen, b.NoiDung, b.NgayTao, b.TrangThai);
}
