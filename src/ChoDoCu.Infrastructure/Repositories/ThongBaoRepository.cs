using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class ThongBaoRepository : Repository<ThongBao>, IThongBaoRepository
{
    public ThongBaoRepository(ApplicationDbContext context) : base(context) { }

    public async Task<(IReadOnlyList<ThongBao> Items, int TotalCount)> DanhSachTheoNguoiDungAsync(
        int idNguoiDung, int page, int pageSize)
    {
        var query = _dbSet.AsNoTracking().Where(x => x.IdNguoiDung == idNguoiDung);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.NgayTao)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public Task<int> DemChuaDocAsync(int idNguoiDung) =>
        _dbSet.CountAsync(x => x.IdNguoiDung == idNguoiDung && x.TrangThai == "ChuaDoc");
}
