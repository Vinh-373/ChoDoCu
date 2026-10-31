using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace ChoDoCu.Infrastructure.Repositories;

public class BaiDangRepository : Repository<BaiDang>, IBaiDangRepository
{
    public BaiDangRepository(ApplicationDbContext context) : base(context) { }

    public async Task AddWithGeneratedMaTinAsync(BaiDang baiDang)
    {
        await _dbSet.AddAsync(baiDang);
        await _context.SaveChangesAsync();

        if (baiDang.Id is <= 0 or > 99_999)
            throw new InvalidOperationException("ID bài đăng phải nằm trong khoảng 1 đến 99999 để tạo mã tin.");

        baiDang.MaTin = $"CD{baiDang.Id:D5}";
        await _context.SaveChangesAsync();
    }

    public Task<BaiDang?> GetChiTietAsync(int id) =>
        _dbSet
            .Include(b => b.SanPham)
                .ThenInclude(s => s.SanPhamThuocTinhs)
            .Include(b => b.NguoiDung)
            .Include(b => b.DanhMuc)
            .Include(b => b.ThanhPho)
            .Include(b => b.HinhAnhBaiDangs)
            .Include(b => b.AnhSanPhams)
            .FirstOrDefaultAsync(b => b.Id == id);

    public async Task<(IReadOnlyList<BaiDang> Items, int TotalCount)> TimKiemAsync(
        int? idDanhMuc,
        int? idThanhPho,
        int? idPhuongXa,
        string? keyword,
        decimal? giaTu,
        decimal? giaDen,
        string sapXep,
        int page,
        int pageSize)
    {
        var now = DateTime.Now;
        var query = _dbSet
            .AsNoTracking()
            .Include(b => b.SanPham)
            .Include(b => b.NguoiDung)
            .Include(b => b.DanhMuc)
            .Include(b => b.ThanhPho)
            .Include(b => b.HinhAnhBaiDangs)
            .Include(b => b.AnhSanPhams)
            .Where(b => b.TrangThai == TrangThaiBaiDang.DaDuyet
                && (b.NgayHetHan == null || b.NgayHetHan > now));

        if (idDanhMuc.HasValue)
        {
            var danhMucLienKet = await _context.DanhMucs
                .AsNoTracking()
                .Select(d => new { d.Id, d.IdDanhMucCha })
                .ToListAsync();
            var danhMucConTheoCha = danhMucLienKet.ToLookup(d => d.IdDanhMucCha, d => d.Id);
            var danhMucIds = new HashSet<int> { idDanhMuc.Value };
            var danhMucChoDuyet = new Queue<int>();
            danhMucChoDuyet.Enqueue(idDanhMuc.Value);

            while (danhMucChoDuyet.Count > 0)
            {
                var idDanhMucCha = danhMucChoDuyet.Dequeue();
                foreach (var idDanhMucCon in danhMucConTheoCha[idDanhMucCha])
                {
                    if (danhMucIds.Add(idDanhMucCon))
                        danhMucChoDuyet.Enqueue(idDanhMucCon);
                }
            }

            query = query.Where(b => danhMucIds.Contains(b.IdDanhMuc));
        }
        if (idThanhPho.HasValue) query = query.Where(b => b.IdThanhPho == idThanhPho);
        if (idPhuongXa.HasValue) query = query.Where(b => b.IdPhuongXa == idPhuongXa);
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.Trim();
            query = query.Where(b => b.TieuDe.Contains(kw) || b.NoiDung.Contains(kw));
        }
        if (giaTu.HasValue) query = query.Where(b => b.Gia >= giaTu.Value);
        if (giaDen.HasValue) query = query.Where(b => b.Gia <= giaDen.Value);

        var total = await query.CountAsync();

        var sortedQuery = sapXep switch
        {
            "uuTien" => query
                .OrderByDescending(b => b.UuTien.HasValue && b.UuTien.Value > now)
                .ThenByDescending(b => b.NgayDayTin ?? b.NgayDang),
            "moiNhat" => query
                .OrderByDescending(b => b.NgayDang),
            "giaTang" => query
                .OrderBy(b => b.Gia),
            "giaGiam" => query
                .OrderByDescending(b => b.Gia),
            "xemNhieu" => query
                .OrderByDescending(b => b.LuotXem),
            _ => throw new ArgumentOutOfRangeException(nameof(sapXep))
        };

        var items = await sortedQuery
            .ThenByDescending(b => b.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<(IReadOnlyList<TProjection> Items, int TotalCount)> DanhSachCuaToiAsync<TProjection>(
        int idNguoiDung,
        TrangThaiBaiDang? trangThai,
        string? keyword,
        int? idDanhMuc,
        string sapXep,
        int page,
        int pageSize,
        Expression<Func<BaiDang, TProjection>> selector)
    {
        var query = _dbSet.AsNoTracking().Where(b => b.IdNguoiDung == idNguoiDung);

        if (trangThai.HasValue)
            query = query.Where(b => b.TrangThai == trangThai.Value);
        if (idDanhMuc.HasValue)
            query = query.Where(b => b.IdDanhMuc == idDanhMuc.Value);
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var tuKhoa = keyword.Trim();
            query = query.Where(b => b.TieuDe.Contains(tuKhoa) || b.MaTin.Contains(tuKhoa));
        }

        var total = await query.CountAsync();
        var sapXepQuery = sapXep switch
        {
            "cuNhat" => query.OrderBy(b => b.NgayDang),
            "giaTang" => query.OrderBy(b => b.Gia),
            "giaGiam" => query.OrderByDescending(b => b.Gia),
            "xemNhieu" => query.OrderByDescending(b => b.LuotXem).ThenByDescending(b => b.NgayDang),
            _ => query.OrderByDescending(b => b.NgayDang)
        };
        var items = await sapXepQuery
            .ThenByDescending(b => b.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(selector)
            .ToListAsync();

        return (items, total);
    }

    public async Task<(IReadOnlyList<TProjection> Items, int TotalCount)> DanhSachChoDuyetAsync<TProjection>(
        string? keyword,
        int? idDanhMuc,
        int page,
        int pageSize,
        Expression<Func<BaiDang, TProjection>> selector)
    {
        var query = _dbSet.AsNoTracking()
            .Where(b => b.TrangThai == TrangThaiBaiDang.ChoDuyet);

        if (idDanhMuc.HasValue)
            query = query.Where(b => b.IdDanhMuc == idDanhMuc.Value);
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var tuKhoa = keyword.Trim();
            query = query.Where(b => b.TieuDe.Contains(tuKhoa) || b.MaTin.Contains(tuKhoa));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(b => b.NgayDang)
            .ThenBy(b => b.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(selector)
            .ToListAsync();

        return (items, total);
    }

    public async Task<IReadOnlyDictionary<TrangThaiBaiDang, int>> ThongKeCuaToiAsync(int idNguoiDung)
    {
        var counts = await _dbSet.AsNoTracking()
            .Where(b => b.IdNguoiDung == idNguoiDung)
            .GroupBy(b => b.TrangThai)
            .Select(group => new { TrangThai = group.Key, SoLuong = group.Count() })
            .ToDictionaryAsync(x => x.TrangThai, x => x.SoLuong);

        return counts;
    }

    public Task<TProjection?> GetChiTietProjectionAsync<TProjection>(
        int id,
        Expression<Func<BaiDang, TProjection>> selector) =>
        _dbSet.AsNoTracking()
            .Where(b => b.Id == id)
            .Select(selector)
            .FirstOrDefaultAsync();

    public async Task<IReadOnlyList<HinhAnhBaiDang>> GetHinhAnhChiTietAsync(int id) =>
        await _context.HinhAnhBaiDangs.AsNoTracking()
            .Where(h => h.IdBaiDang == id)
            .OrderBy(h => h.ThuTu)
            .ToListAsync();

    public async Task<IReadOnlyList<AnhSanPham>> GetAnhSanPhamChiTietAsync(int id) =>
        await _context.AnhSanPhams.AsNoTracking()
            .Where(a => a.IdBaiDang == id)
            .ToListAsync();

    public async Task<IReadOnlyList<TProjection>> GetThuocTinhChiTietAsync<TProjection>(
        int id,
        Expression<Func<SanPhamThuocTinh, TProjection>> selector) =>
        await _context.SanPhamThuocTinhs.AsNoTracking()
            .Where(t => t.SanPham.BaiDang != null && t.SanPham.BaiDang.Id == id)
            .OrderBy(t => t.ThuocTinh.ThuTu)
            .Select(selector)
            .ToListAsync();

    public async Task TangLuotXemAsync(int id)
    {
        await _dbSet.Where(b => b.Id == id)
            .ExecuteUpdateAsync(updates => updates.SetProperty(b => b.LuotXem, b => b.LuotXem + 1));
    }

    public async Task<bool> TryDayTinAsync(int id, int idNguoiDung, DateTime now) =>
        await _dbSet
            .Where(b => b.Id == id
                && b.IdNguoiDung == idNguoiDung
                && b.TrangThai == TrangThaiBaiDang.DaDuyet
                && (b.NgayHetHan == null || b.NgayHetHan > now))
            .ExecuteUpdateAsync(updates => updates.SetProperty(b => b.NgayDayTin, now)) == 1;

    public async Task<bool> GiaHanAsync(int id, int idNguoiDung, DateTime now, int soNgay) =>
        await _dbSet
            .Where(b => b.Id == id
                && b.IdNguoiDung == idNguoiDung
                && (b.TrangThai == TrangThaiBaiDang.DaDuyet
                    || b.TrangThai == TrangThaiBaiDang.DaAn))
            .ExecuteUpdateAsync(updates => updates.SetProperty(
                b => b.NgayHetHan,
                b => b.NgayHetHan.HasValue && b.NgayHetHan.Value > now
                    ? b.NgayHetHan.Value.AddDays(soNgay)
                    : now.AddDays(soNgay))) == 1;
}
