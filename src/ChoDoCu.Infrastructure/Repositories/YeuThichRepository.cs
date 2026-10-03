using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class YeuThichRepository : Repository<YeuThich>, IYeuThichRepository
{
    public YeuThichRepository(ApplicationDbContext context) : base(context) { }

    public Task<YeuThich?> TimAsync(int idNguoiDung, int idBaiDang) =>
        _dbSet.FirstOrDefaultAsync(x => x.IdNguoiDung == idNguoiDung && x.IdBaiDang == idBaiDang);

    public async Task<(IReadOnlyList<YeuThich> Items, int TotalCount)> DanhSachTheoNguoiDungAsync(
        int idNguoiDung, int page, int pageSize)
    {
        var query = _dbSet.AsNoTracking()
            .Include(x => x.BaiDang).ThenInclude(b => b.SanPham)
            .Include(x => x.BaiDang).ThenInclude(b => b.AnhSanPhams)
            .Where(x => x.IdNguoiDung == idNguoiDung);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.NgayTao)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync();

        return (items, total);
    }
}
