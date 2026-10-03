using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Favorite.DTOs;
using ChoDoCu.Application.Features.Favorite.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;

namespace ChoDoCu.Application.Features.Favorite.Services;

public class YeuThichService : IYeuThichService
{
    private readonly IUnitOfWork _uow;
    public YeuThichService(IUnitOfWork uow) => _uow = uow;

    public async Task<bool> ToggleAsync(int idNguoiDung, int idBaiDang)
    {
        var baiDang = await _uow.BaiDangs.GetByIdAsync(idBaiDang)
            ?? throw new NotFoundException(nameof(BaiDang), idBaiDang);

        var daThich = await _uow.YeuThichs.TimAsync(idNguoiDung, idBaiDang);
        if (daThich is not null)
        {
            _uow.YeuThichs.Remove(daThich);
            await _uow.SaveChangesAsync();
            return false;
        }

        await _uow.YeuThichs.AddAsync(new YeuThich { IdNguoiDung = idNguoiDung, IdBaiDang = idBaiDang });
        await _uow.SaveChangesAsync();
        return true;
    }

    public async Task<PagedResult<YeuThichResponse>> DanhSachAsync(int idNguoiDung, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var (items, total) = await _uow.YeuThichs.DanhSachTheoNguoiDungAsync(idNguoiDung, page, pageSize);

        var mapped = items.Select(x => new YeuThichResponse(
            x.Id, x.IdBaiDang, x.BaiDang.TieuDe, x.BaiDang.SanPham.GiaTien,
            x.BaiDang.AnhSanPhams.FirstOrDefault()?.Url, x.NgayTao)).ToList();

        return new PagedResult<YeuThichResponse>(mapped, total, page, pageSize);
    }
}
