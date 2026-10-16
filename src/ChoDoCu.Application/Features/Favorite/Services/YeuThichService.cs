using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Favorite.DTOs;
using ChoDoCu.Application.Features.Favorite.Interfaces;
using ChoDoCu.Application.Features.Notification.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;

namespace ChoDoCu.Application.Features.Favorite.Services;

public class YeuThichService : IYeuThichService
{
    private readonly IUnitOfWork _uow;
    private readonly IThongBaoService _thongBaoService;

    public YeuThichService(
        IUnitOfWork uow,
        IThongBaoService thongBaoService)
    {
        _uow = uow;
        _thongBaoService = thongBaoService;
    }


    public async Task<bool> ToggleAsync(int idNguoiDung, int idBaiDang)
    {
        var baiDang = await _uow.BaiDangs.GetByIdAsync(idBaiDang)
            ?? throw new NotFoundException(nameof(BaiDang), idBaiDang);

        var daThich = await _uow.YeuThichs.TimAsync(
            idNguoiDung, idBaiDang);

        // Đã thích rồi thì lần bấm này là bỏ thích.
        if (daThich is not null)
        {
            _uow.YeuThichs.Remove(daThich);
            await _uow.SaveChangesAsync();
            return false;
        }

        // Thêm lượt thích mới.
        await _uow.YeuThichs.AddAsync(new YeuThich
        {
            IdNguoiDung = idNguoiDung,
            IdBaiDang = idBaiDang
        });

        await _uow.SaveChangesAsync();

        // Chỉ thông báo khi người khác thích bài đăng.
        // Cần lấy đúng ID chủ bài đăng từ entity BaiDang.
        if (baiDang.IdNguoiDung != idNguoiDung)
        {
            await _thongBaoService.TaoAsync(
                baiDang.IdNguoiDung,
                "Bài đăng của bạn có lượt thích mới",
                $"Bài đăng \"{baiDang.TieuDe}\" vừa được một người dùng yêu thích.");
        }

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
