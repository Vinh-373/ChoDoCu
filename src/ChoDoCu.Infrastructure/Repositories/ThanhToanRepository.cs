using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class ThanhToanRepository : Repository<ThanhToan>, IThanhToanRepository
{
    public ThanhToanRepository(ApplicationDbContext context) : base(context) { }

    public Task<ThanhToan?> GetKemMuaDichVuTheoMaNgoaiAsync(string maGiaoDichNgoai) =>
        _dbSet
            .Include(x => x.MuaDichVu)
                .ThenInclude(x => x.DichVu)
            .Include(x => x.PhuongThucTT)
            .FirstOrDefaultAsync(x => x.MaGiaoDichNgoai == maGiaoDichNgoai);

    public Task<ThanhToan?> GetCuaNguoiDungAsync(int idThanhToan, int idNguoiDung) =>
        _dbSet.AsNoTracking()
            .Include(x => x.MuaDichVu)
            .FirstOrDefaultAsync(x => x.Id == idThanhToan && x.MuaDichVu.IdNguoiDung == idNguoiDung);
}
