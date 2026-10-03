using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class HoiThoaiRepository : Repository<HoiThoai>, IHoiThoaiRepository
{
    public HoiThoaiRepository(ApplicationDbContext context) : base(context) { }

    public Task<HoiThoai?> TimTheoCapNguoiDungAsync(int idNho, int idLon) =>
        _dbSet.FirstOrDefaultAsync(x => x.IdNguoiDung1 == idNho && x.IdNguoiDung2 == idLon);

    public async Task<IReadOnlyList<HoiThoai>> DanhSachTheoNguoiDungAsync(int idNguoiDung) =>
        await _dbSet.AsNoTracking()
            .Include(x => x.NguoiDung1)
            .Include(x => x.NguoiDung2)
            .Where(x => x.IdNguoiDung1 == idNguoiDung || x.IdNguoiDung2 == idNguoiDung)
            .OrderByDescending(x => x.TinNhanCuoi ?? x.NgayTao)
            .ToListAsync();
}
