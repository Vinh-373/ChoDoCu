using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class DichVuRepository : Repository<DichVu>, IDichVuRepository
{
    public DichVuRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<DichVu>> DanhSachDangHoatDongAsync() =>
        await _dbSet.AsNoTracking()
            .Where(x => x.TrangThai == "HoatDong")
            .OrderBy(x => x.Gia)
            .ToListAsync();
}
