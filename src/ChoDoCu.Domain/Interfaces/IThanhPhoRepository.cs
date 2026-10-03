using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IThanhPhoRepository : IRepository<ThanhPho>
{
    Task<IReadOnlyList<ThanhPho>> DanhSachAsync();
}
