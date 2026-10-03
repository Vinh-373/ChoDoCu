using ChoDoCu.Application.Features.Location.DTOs;
using ChoDoCu.Application.Features.Location.Interfaces;
using ChoDoCu.Domain.Interfaces;

namespace ChoDoCu.Application.Features.Location.Services;

public class DiaChiService : IDiaChiService
{
    private readonly IUnitOfWork _uow;
    public DiaChiService(IUnitOfWork uow) => _uow = uow;

    public async Task<List<ThanhPhoResponse>> DanhSachThanhPhoAsync()
    {
        var list = await _uow.ThanhPhos.DanhSachAsync();
        return list.Select(x => new ThanhPhoResponse(x.Id, x.TenThanhPho)).ToList();
    }

    public async Task<List<PhuongXaResponse>> DanhSachPhuongXaAsync(int idThanhPho)
    {
        var list = await _uow.PhuongXas.DanhSachTheoThanhPhoAsync(idThanhPho);
        return list.Select(x => new PhuongXaResponse(x.Id, x.IdThanhPho, x.TenPhuongXa)).ToList();
    }
}
