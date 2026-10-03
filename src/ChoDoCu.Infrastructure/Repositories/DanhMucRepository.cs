using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class DanhMucRepository : Repository<DanhMuc>, IDanhMucRepository
{
    public DanhMucRepository(ApplicationDbContext context) : base(context) { }

   public async Task<IReadOnlyList<DanhMuc>> GetCayDanhMucAsync() =>
    await _dbSet.AsNoTracking()
        .Include(d => d.DanhMucCons)
        .Where(d => d.IdDanhMucCha == null)
        .OrderBy(d => d.TenDanhMuc)
        .ToListAsync();

    public Task<bool> CoDanhMucConAsync(int idDanhMuc) =>
        _dbSet.AnyAsync(d => d.IdDanhMucCha == idDanhMuc);
}
