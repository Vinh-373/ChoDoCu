using ChoDoCu.Application.Features.Location.DTOs;

namespace ChoDoCu.Application.Features.Location.Interfaces;

public interface IDiaChiService
{
    Task<List<ThanhPhoResponse>> DanhSachThanhPhoAsync();
    Task<List<PhuongXaResponse>> DanhSachPhuongXaAsync(int idThanhPho);
}
