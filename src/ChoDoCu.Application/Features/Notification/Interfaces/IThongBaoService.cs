using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Notification.DTOs;

namespace ChoDoCu.Application.Features.Notification.Interfaces;

public interface IThongBaoService
{
    Task<PagedResult<ThongBaoResponse>> DanhSachAsync(int idNguoiDung, int page, int pageSize);
    Task<int> DemChuaDocAsync(int idNguoiDung);
    Task DanhDauDaDocAsync(int idNguoiDung, int idThongBao);

    /// <summary>Dùng nội bộ khi có sự kiện (bài đăng được duyệt, có tin nhắn mới...).</summary>
    Task TaoAsync(int idNguoiDung, string tieuDe, string? noiDung);
}
