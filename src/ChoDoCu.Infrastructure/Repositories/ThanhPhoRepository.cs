using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class ThanhPhoRepository : Repository<ThanhPho>, IThanhPhoRepository
{
    public ThanhPhoRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<ThanhPho>> DanhSachAsync() =>
        await _dbSet.AsNoTracking().OrderBy(x => x.TenThanhPho).ToListAsync();
}
