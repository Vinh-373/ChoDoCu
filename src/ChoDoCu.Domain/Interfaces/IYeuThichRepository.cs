using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IYeuThichRepository : IRepository<YeuThich>
{
    Task<YeuThich?> TimAsync(int idNguoiDung, int idBaiDang);
    Task<(IReadOnlyList<YeuThich> Items, int TotalCount)> DanhSachTheoNguoiDungAsync(int idNguoiDung, int page, int pageSize);
}
