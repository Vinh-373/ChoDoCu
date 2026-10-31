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

    public async Task<IReadOnlyList<ThuocTinhSanPham>> GetThuocTinhDanhMucAsync(int idDanhMuc) =>
        await _context.ThuocTinhSanPhams.AsNoTracking()
            .Where(x => x.IdDanhMuc == idDanhMuc && x.TrangThai == "HoatDong")
            .OrderBy(x => x.ThuTu)
            .ThenBy(x => x.Id)
            .ToListAsync();

    public async Task<IReadOnlyList<Hang>> GetHangsDanhMucAsync(int idDanhMuc) =>
        await _context.DongSanPhams.AsNoTracking()
            .Where(x => x.IdDanhMuc == idDanhMuc
                && x.TrangThai == "HoatDong"
                && x.Hang.TrangThai == "HoatDong")
            .Select(x => x.Hang)
            .Distinct()
            .OrderBy(x => x.TenHang)
            .ToListAsync();

    public async Task<IReadOnlyList<DongSanPham>> GetDongSanPhamsDanhMucAsync(int idDanhMuc, int? idHang) =>
        await _context.DongSanPhams.AsNoTracking()
            .Where(x => x.IdDanhMuc == idDanhMuc
                && x.TrangThai == "HoatDong"
                && (!idHang.HasValue || x.IdHang == idHang.Value))
            .OrderBy(x => x.TenDongSanPham)
            .ToListAsync();

    public Task<bool> CoDanhMucConAsync(int idDanhMuc) =>
        _dbSet.AnyAsync(d => d.IdDanhMucCha == idDanhMuc);
}
