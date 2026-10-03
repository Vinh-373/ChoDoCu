using ChoDoCu.Application.Features.Category.DTOs;

namespace ChoDoCu.Application.Features.Category.Interfaces;

public interface IDanhMucService
{
    Task<List<DanhMucResponse>> GetCayDanhMucAsync();
    Task<DanhMucResponse> TaoAsync(TaoDanhMucRequest request);
    Task<DanhMucResponse> CapNhatAsync(int id, CapNhatDanhMucRequest request);
    Task XoaAsync(int id);
}
