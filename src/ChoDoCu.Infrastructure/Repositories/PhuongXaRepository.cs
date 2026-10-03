using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class PhuongXaRepository : Repository<PhuongXa>, IPhuongXaRepository
{
    public PhuongXaRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<PhuongXa>> DanhSachTheoThanhPhoAsync(int idThanhPho) =>
        await _dbSet.AsNoTracking()
            .Where(x => x.IdThanhPho == idThanhPho)
            .OrderBy(x => x.TenPhuongXa)
            .ToListAsync();
}
