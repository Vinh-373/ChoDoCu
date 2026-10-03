using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IPhuongXaRepository : IRepository<PhuongXa>
{
    Task<IReadOnlyList<PhuongXa>> DanhSachTheoThanhPhoAsync(int idThanhPho);
}
