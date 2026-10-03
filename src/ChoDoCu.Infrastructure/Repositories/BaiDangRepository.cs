using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class BaiDangRepository : Repository<BaiDang>, IBaiDangRepository
{
    public BaiDangRepository(ApplicationDbContext context) : base(context) { }

    public Task<BaiDang?> GetChiTietAsync(int id) =>
        _dbSet
            .Include(b => b.SanPham)
            .Include(b => b.NguoiDung)
            .Include(b => b.DanhMuc)
            .Include(b => b.ThanhPho)
            .Include(b => b.AnhSanPhams)
            .FirstOrDefaultAsync(b => b.Id == id);

    public async Task<(IReadOnlyList<BaiDang> Items, int TotalCount)> TimKiemAsync(
        int? idDanhMuc, int? idThanhPho, string? tuKhoa, int page, int pageSize)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(b => b.SanPham)
            .Include(b => b.NguoiDung)
            .Include(b => b.DanhMuc)
            .Include(b => b.ThanhPho)
            .Include(b => b.AnhSanPhams)
            .Where(b => b.TrangThai == TrangThaiBaiDang.DaDuyet);

        if (idDanhMuc.HasValue) query = query.Where(b => b.IdDanhMuc == idDanhMuc);
        if (idThanhPho.HasValue) query = query.Where(b => b.IdThanhPho == idThanhPho);
        if (!string.IsNullOrWhiteSpace(tuKhoa))
        {
            var kw = tuKhoa.Trim();
            query = query.Where(b => b.TieuDe.Contains(kw));
        }

        var total = await query.CountAsync();

        // Bài ưu tiên lên đầu (SQL Server: NULL nhỏ nhất nên DESC đẩy NULL xuống cuối), sau đó mới nhất trước
        var items = await query
            .OrderByDescending(b => b.UuTien)
            .ThenByDescending(b => b.NgayDang)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }
}
