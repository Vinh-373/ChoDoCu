using ChoDoCu.Application.Features.Service.DTOs;

namespace ChoDoCu.Application.Features.Service.Interfaces;

public interface IDichVuService
{
    Task<List<DichVuResponse>> DanhSachAsync();
    Task<List<DichVuResponse>> DanhSachQuanTriAsync();
    Task<DichVuResponse> TaoAsync(TaoDichVuRequest request);
    Task<DichVuResponse> CapNhatAsync(int id, CapNhatDichVuRequest request);
    Task XoaAsync(int id);
    Task KichHoatAsync(int id);
}
