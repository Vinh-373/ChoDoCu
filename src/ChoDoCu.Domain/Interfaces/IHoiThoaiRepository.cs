using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IHoiThoaiRepository : IRepository<HoiThoai>
{
    Task<HoiThoai?> TimTheoCapNguoiDungAsync(int idNho, int idLon);
    Task<IReadOnlyList<HoiThoai>> DanhSachTheoNguoiDungAsync(int idNguoiDung);
}
