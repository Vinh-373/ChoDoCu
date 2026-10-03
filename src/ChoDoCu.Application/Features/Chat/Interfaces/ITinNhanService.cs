using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Chat.DTOs;

namespace ChoDoCu.Application.Features.Chat.Interfaces;

public interface ITinNhanService
{
    Task<List<HoiThoaiResponse>> DanhSachHoiThoaiAsync(int idNguoiDung);
    Task<PagedResult<TinNhanResponse>> DanhSachTinNhanAsync(int idNguoiDung, int idHoiThoai, int page, int pageSize);
    Task<TinNhanResponse> GuiAsync(int idNguoiGui, GuiTinNhanRequest request);
}
