using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class LichSuTimKiemRepository : Repository<LichSuTimKiem>, ILichSuTimKiemRepository
{
    public LichSuTimKiemRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<LichSuTimKiem>> LichSuGanNhatAsync(int idNguoiDung, int soLuong) =>
        await _dbSet.AsNoTracking()
            .Where(x => x.IdNguoiDung == idNguoiDung)
            .OrderByDescending(x => x.NgayTao)
            .Take(soLuong)
            .ToListAsync();
}
