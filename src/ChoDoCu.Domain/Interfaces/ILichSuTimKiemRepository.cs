using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface ILichSuTimKiemRepository : IRepository<LichSuTimKiem>
{
    Task<IReadOnlyList<LichSuTimKiem>> LichSuGanNhatAsync(int idNguoiDung, int soLuong);
}
