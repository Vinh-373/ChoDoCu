using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class MuaDichVuRepository : Repository<MuaDichVu>, IMuaDichVuRepository
{
    public MuaDichVuRepository(ApplicationDbContext context) : base(context) { }

    public Task<MuaDichVu?> GetKemDichVuAsync(int id) =>
        _dbSet.Include(x => x.DichVu).FirstOrDefaultAsync(x => x.Id == id);

    public async Task<IReadOnlyList<MuaDichVu>> LichSuTheoNguoiDungAsync(int idNguoiDung) =>
        await _dbSet
            .AsNoTracking()
            .Where(x => x.IdNguoiDung == idNguoiDung)
            .Include(x => x.DichVu)
            .Include(x => x.ThanhToans)
            .OrderByDescending(x => x.NgayMua)
            .ToListAsync();
}
