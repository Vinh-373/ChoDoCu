using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IDichVuRepository : IRepository<DichVu>
{
    Task<IReadOnlyList<DichVu>> DanhSachDangHoatDongAsync();
}
