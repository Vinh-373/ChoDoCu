using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Account.DTOs;

namespace ChoDoCu.Application.Features.Account.Interfaces;

public interface INguoiDungService
{
    // ----- Hồ sơ cá nhân -----
    Task<HoSoResponse> GetHoSoAsync(int idNguoiDung);
    Task<HoSoResponse> CapNhatHoSoAsync(int idNguoiDung, CapNhatHoSoRequest request);

    // ----- Quản trị -----
    Task<PagedResult<NguoiDungListItem>> DanhSachAsync(
        string? keyword, string? trangThai, string? role, int page, int pageSize);

    Task KhoaAsync(int idAdmin, int idNguoiDung);
    Task MoKhoaAsync(int idNguoiDung);
}
