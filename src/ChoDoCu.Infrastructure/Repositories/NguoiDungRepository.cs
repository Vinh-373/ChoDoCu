using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class NguoiDungRepository : INguoiDungRepository
{
    private readonly ApplicationDbContext _context;

    public NguoiDungRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(NguoiDung nguoiDung)
    {
        await _context.Users.AddAsync(nguoiDung);
    }

    public async Task<NguoiDung?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public void Update(NguoiDung nguoiDung)
    {
        _context.Users.Update(nguoiDung);
    }

    public void Remove(NguoiDung nguoiDung)
    {
        _context.Users.Remove(nguoiDung);
    }

    public Task<NguoiDung?> GetByEmailAsync(string email) =>
        _context.Users.FirstOrDefaultAsync(x => x.Email == email);

    public Task<bool> EmailDaTonTaiAsync(string email) =>
        _context.Users.AnyAsync(x => x.Email == email);

    public Task<bool> SoDienThoaiDaTonTaiAsync(string soDienThoai) =>
        _context.Users.AnyAsync(x => x.SoDienThoai == soDienThoai);

    public Task<bool> SoDienThoaiDaDuocNguoiKhacDungAsync(string soDienThoai, int idNguoiDung) =>
        _context.Users.AnyAsync(x => x.SoDienThoai == soDienThoai && x.Id != idNguoiDung);

    public Task<NguoiDung?> GetKemDiaChiAsync(int id) =>
        _context.Users
            .AsNoTracking()
            .Include(x => x.ThanhPho)
            .Include(x => x.PhuongXa)
            .FirstOrDefaultAsync(x => x.Id == id);

    public async Task<(IReadOnlyList<NguoiDung> Items, int Total)> TimKiemAsync(
        string? keyword, TrangThaiNguoiDung? trangThai, string? role, int page, int pageSize)
    {
        var query = _context.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(keyword))
            query = query.Where(x =>
                x.HoTen.Contains(keyword) ||
                (x.Email != null && x.Email.Contains(keyword)) ||
                x.SoDienThoai.Contains(keyword));

        if (trangThai.HasValue)
            query = query.Where(x => x.TrangThai == trangThai.Value);

        if (!string.IsNullOrEmpty(role))
            query = query.Where(x => _context.UserRoles.Any(ur =>
                ur.UserId == x.Id &&
                _context.Roles.Any(r => r.Id == ur.RoleId && r.Name == role)));

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.NgayTao)
            .ThenByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<Dictionary<int, List<string>>> LayRolesAsync(IEnumerable<int> idNguoiDungs)
    {
        var ids = idNguoiDungs.Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<int, List<string>>();

        var rows = await (
            from ur in _context.UserRoles
            join r in _context.Roles on ur.RoleId equals r.Id
            where ids.Contains(ur.UserId)
            select new { ur.UserId, r.Name }).ToListAsync();

        return rows
            .GroupBy(x => x.UserId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.Name!).OrderBy(n => n).ToList());
    }
}
