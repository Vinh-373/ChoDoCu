using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Account.DTOs;

namespace ChoDoCu.Application.Features.Account.Interfaces;

public interface INguoiDungService
{
    Task<HoSoResponse> GetHoSoAsync(int idNguoiDung);
    Task<HoSoResponse> CapNhatHoSoAsync(int idNguoiDung, CapNhatHoSoRequest request);

    /// <summary>Gửi mã xác nhận đổi số điện thoại tới email của tài khoản.</summary>
    Task YeuCauDoiSoDienThoaiAsync(int idNguoiDung, YeuCauDoiSoDienThoaiRequest request);

    /// <summary>Kiểm tra mã nhận qua email rồi đổi số điện thoại.</summary>
    Task<HoSoResponse> XacNhanDoiSoDienThoaiAsync(int idNguoiDung, XacNhanDoiSoDienThoaiRequest request);

    Task<PagedResult<NguoiDungListItem>> DanhSachAsync(string? keyword, string? trangThai, string? role, int page, int pageSize);
    Task KhoaAsync(int idAdmin, int idNguoiDung);
    Task MoKhoaAsync(int idNguoiDung);
}
