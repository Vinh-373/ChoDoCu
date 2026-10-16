
using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;
public interface IPhuongThucThanhToanRepository : IRepository<PhuongThucThanhToan>
{
    Task<List<PhuongThucThanhToan>> LayDanhSachHoatDongAsync();
}
