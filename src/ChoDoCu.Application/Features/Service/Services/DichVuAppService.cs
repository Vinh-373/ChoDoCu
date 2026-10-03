using ChoDoCu.Application.Features.Service.DTOs;
using ChoDoCu.Application.Features.Service.Interfaces;
using ChoDoCu.Domain.Interfaces;

namespace ChoDoCu.Application.Features.Service.Services;

// Đặt tên "DichVuAppService" (không phải DichVuService) để tránh trùng tên với entity DichVu khi using namespace.
public class DichVuAppService : IDichVuService
{
    private readonly IUnitOfWork _uow;
    public DichVuAppService(IUnitOfWork uow) => _uow = uow;

    public async Task<List<DichVuResponse>> DanhSachAsync()
    {
        var list = await _uow.DichVus.DanhSachDangHoatDongAsync();
        return list.Select(x => new DichVuResponse(x.Id, x.TenDichVu, x.Gia, x.ThoiGianDichVu)).ToList();
    }
}
