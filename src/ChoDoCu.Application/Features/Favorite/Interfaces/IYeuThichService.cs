using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Favorite.DTOs;

namespace ChoDoCu.Application.Features.Favorite.Interfaces;

public interface IYeuThichService
{
    /// <summary>Bật/tắt yêu thích. Trả về true nếu SAU thao tác là đã thích, false nếu đã bỏ thích.</summary>
    Task<bool> ToggleAsync(int idNguoiDung, int idBaiDang);
    Task<PagedResult<YeuThichResponse>> DanhSachAsync(int idNguoiDung, int page, int pageSize);
}
