using ChoDoCu.Application.Features.Service.DTOs;

namespace ChoDoCu.Application.Features.Service.Interfaces;

public interface IDichVuService
{
    Task<List<DichVuResponse>> DanhSachAsync();
}
