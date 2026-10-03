using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface ITinNhanRepository : IRepository<TinNhan>
{
    Task<(IReadOnlyList<TinNhan> Items, int TotalCount)> DanhSachTheoHoiThoaiAsync(int idHoiThoai, int page, int pageSize);
    Task DanhDauDaXemAsync(int idHoiThoai, int idNguoiNhan);
}
