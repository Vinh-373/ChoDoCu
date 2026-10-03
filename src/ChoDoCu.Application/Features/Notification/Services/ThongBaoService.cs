using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Notification.DTOs;
using ChoDoCu.Application.Features.Notification.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;

namespace ChoDoCu.Application.Features.Notification.Services;

public class ThongBaoService : IThongBaoService
{
    private readonly IUnitOfWork _uow;
    public ThongBaoService(IUnitOfWork uow) => _uow = uow;

    public async Task<PagedResult<ThongBaoResponse>> DanhSachAsync(int idNguoiDung, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var (items, total) = await _uow.ThongBaos.DanhSachTheoNguoiDungAsync(idNguoiDung, page, pageSize);
        var mapped = items.Select(x => new ThongBaoResponse(x.Id, x.TieuDe, x.NoiDung, x.NgayTao, x.TrangThai)).ToList();

        return new PagedResult<ThongBaoResponse>(mapped, total, page, pageSize);
    }

    public Task<int> DemChuaDocAsync(int idNguoiDung) => _uow.ThongBaos.DemChuaDocAsync(idNguoiDung);

    public async Task DanhDauDaDocAsync(int idNguoiDung, int idThongBao)
    {
        var tb = await _uow.ThongBaos.GetByIdAsync(idThongBao)
            ?? throw new NotFoundException(nameof(ThongBao), idThongBao);

        if (tb.IdNguoiDung != idNguoiDung)
            throw new DomainException("Bạn không có quyền với thông báo này.");

        tb.DanhDauDaDoc();
        await _uow.SaveChangesAsync();
    }

    public async Task TaoAsync(int idNguoiDung, string tieuDe, string? noiDung)
    {
        await _uow.ThongBaos.AddAsync(new ThongBao { IdNguoiDung = idNguoiDung, TieuDe = tieuDe, NoiDung = noiDung });
        await _uow.SaveChangesAsync();
    }
}
