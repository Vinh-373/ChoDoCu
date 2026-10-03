using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Report.DTOs;

namespace ChoDoCu.Application.Features.Report.Interfaces;

public interface IBaoCaoService
{
    Task<BaoCaoResponse> TaoAsync(int idNguoiDung, TaoBaoCaoRequest request);
    Task<PagedResult<BaoCaoResponse>> DanhSachAsync(string? trangThai, int page, int pageSize);
    Task XuLyAsync(int id, string trangThaiMoi);
}
