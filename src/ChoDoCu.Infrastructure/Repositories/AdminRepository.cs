using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public sealed class AdminRepository : IAdminRepository
{
    private readonly ApplicationDbContext _context;

    public AdminRepository(ApplicationDbContext context) => _context = context;

    public async Task<(int Users, int Posts, int Transactions, int Reports)> GetDashboardCountsAsync()
    {
        var users = await _context.Users.CountAsync();
        var posts = await _context.BaiDangs.CountAsync();
        var transactions = await _context.ThanhToans.CountAsync();
        var reports = await _context.BaoCaos.CountAsync();
        return (users, posts, transactions, reports);
    }

    public async Task<(IReadOnlyList<SanPham> Items, int Total)> ListProductsAsync(
        string? keyword, int? idDanhMuc, int? idHang, int page, int pageSize)
    {
        var query = _context.SanPhams.AsNoTracking()
            .Include(x => x.DanhMuc)
            .Include(x => x.Hang)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(x => x.TenSanPham.Contains(keyword));
        if (idDanhMuc.HasValue)
            query = query.Where(x => x.IdDanhMuc == idDanhMuc.Value);
        if (idHang.HasValue)
            query = query.Where(x => x.IdHang == idHang.Value);

        var total = await query.CountAsync();
        var items = await query.OrderBy(x => x.TenSanPham)
            .ThenBy(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return (items, total);
    }

    public Task<SanPham?> GetProductAsync(int id) =>
        _context.SanPhams.FirstOrDefaultAsync(x => x.Id == id);

    public Task<SanPham?> GetProductForResponseAsync(int id) =>
        _context.SanPhams.AsNoTracking()
            .Include(x => x.DanhMuc)
            .Include(x => x.Hang)
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> CategoryExistsAsync(int id) =>
        _context.DanhMucs.AnyAsync(x => x.Id == id);

    public Task<bool> BrandExistsAsync(int id) =>
        _context.Hangs.AnyAsync(x => x.Id == id);

    public Task<bool> ProductLineExistsAsync(int id, int? idHang, int? idDanhMuc) =>
        _context.DongSanPhams.AnyAsync(x =>
            x.Id == id &&
            (!idHang.HasValue || x.IdHang == idHang.Value) &&
            (!idDanhMuc.HasValue || x.IdDanhMuc == idDanhMuc.Value));

    public Task<bool> SpecificProductLineExistsAsync(int id, int? idDongSanPham) =>
        _context.DongCuThes.AnyAsync(x =>
            x.Id == id && (!idDongSanPham.HasValue || x.IdDongSanPham == idDongSanPham.Value));

    public Task<bool> ProductHasPostsAsync(int id) =>
        _context.BaiDangs.AnyAsync(x => x.IdSanPham == id);

    public Task AddProductAsync(SanPham product) => _context.SanPhams.AddAsync(product).AsTask();
    public void RemoveProduct(SanPham product) => _context.SanPhams.Remove(product);

    public async Task<(IReadOnlyList<Hang> Items, int Total)> ListBrandsAsync(
        string? keyword, int page, int pageSize)
    {
        var query = _context.Hangs.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(x => x.TenHang != null && x.TenHang.Contains(keyword));
        var total = await query.CountAsync();
        var items = await query.OrderBy(x => x.TenHang).ThenBy(x => x.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return (items, total);
    }

    public Task<Hang?> GetBrandAsync(int id) => _context.Hangs.FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> BrandHasProductsAsync(int id) =>
        _context.Hangs.AnyAsync(x => x.Id == id && (x.SanPhams.Any() || x.DongSanPhams.Any()));

    public Task AddBrandAsync(Hang brand) => _context.Hangs.AddAsync(brand).AsTask();
    public void RemoveBrand(Hang brand) => _context.Hangs.Remove(brand);

    public async Task<(IReadOnlyList<ThuocTinhSanPham> Items, int Total)> ListAttributesAsync(
        string? keyword, int? idDanhMuc, int page, int pageSize)
    {
        var query = _context.ThuocTinhSanPhams.AsNoTracking()
            .Include(x => x.DanhMuc)
            .Include(x => x.ThuocTinhCha)
            .AsQueryable();
        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(x => x.TenThuocTinh.Contains(keyword));
        if (idDanhMuc.HasValue)
            query = query.Where(x => x.IdDanhMuc == idDanhMuc.Value);
        var total = await query.CountAsync();
        var items = await query.OrderBy(x => x.ThuTu).ThenBy(x => x.TenThuocTinh)
            .ThenBy(x => x.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return (items, total);
    }

    public Task<ThuocTinhSanPham?> GetAttributeAsync(int id) =>
        _context.ThuocTinhSanPhams.FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> AttributeParentExistsAsync(int id) =>
        _context.ThuocTinhSanPhams.AnyAsync(x => x.Id == id);

    public Task<bool> AttributeCategoryExistsAsync(int id) =>
        _context.DanhMucs.AnyAsync(x => x.Id == id);

    public Task<bool> AttributeHasChildrenAsync(int id) =>
        _context.ThuocTinhSanPhams.AnyAsync(x => x.IdThuocTinhCha == id);

    public Task<bool> AttributeHasProductValuesAsync(int id) =>
        _context.SanPhamThuocTinhs.AnyAsync(x => x.IdThuocTinh == id);

    public Task AddAttributeAsync(ThuocTinhSanPham attribute) =>
        _context.ThuocTinhSanPhams.AddAsync(attribute).AsTask();
    public void RemoveAttribute(ThuocTinhSanPham attribute) => _context.ThuocTinhSanPhams.Remove(attribute);

    public Task<int> SaveChangesAsync() => _context.SaveChangesAsync();
}
