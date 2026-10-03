using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class BannerRepository : Repository<Banner>, IBannerRepository
{
    public BannerRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Banner>> DanhSachTheoViTriAsync(string? viTri)
    {
        var query = _dbSet.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(viTri)) query = query.Where(x => x.ViTri == viTri);
        return await query.OrderByDescending(x => x.NgaySua).ToListAsync();
    }
}
