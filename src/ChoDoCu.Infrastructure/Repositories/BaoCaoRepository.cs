using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class BaoCaoRepository : Repository<BaoCao>, IBaoCaoRepository
{
    public BaoCaoRepository(ApplicationDbContext context) : base(context) { }

    public Task<BaoCao?> GetChiTietAsync(int id) =>
        _dbSet.Include(x => x.NguoiDung).Include(x => x.BaiDang).FirstOrDefaultAsync(x => x.Id == id);

    public async Task<(IReadOnlyList<BaoCao> Items, int TotalCount)> DanhSachAsync(
        string? trangThai, int page, int pageSize)
    {
        var query = _dbSet.AsNoTracking()
            .Include(x => x.NguoiDung)
            .Include(x => x.BaiDang)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(trangThai))
            query = query.Where(x => x.TrangThai == trangThai);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.NgayTao)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync();

        return (items, total);
    }
}
