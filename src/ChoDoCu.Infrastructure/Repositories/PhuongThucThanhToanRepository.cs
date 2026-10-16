using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class PhuongThucThanhToanRepository : Repository<PhuongThucThanhToan>, IPhuongThucThanhToanRepository
{
    public PhuongThucThanhToanRepository(ApplicationDbContext context) : base(context) { }

    public Task<List<PhuongThucThanhToan>> LayDanhSachHoatDongAsync() =>
        _context.PhuongThucThanhToans
            .AsNoTracking()
            .Where(x => x.TrangThai == "HoatDong")
            .OrderBy(x => x.Id)
            .ToListAsync();
}
