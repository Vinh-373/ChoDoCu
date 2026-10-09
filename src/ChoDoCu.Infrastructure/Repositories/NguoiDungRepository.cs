using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace ChoDoCu.Infrastructure.Repositories;

public class NguoiDungRepository : INguoiDungRepository
{
    private readonly ApplicationDbContext _context;

    // Giữ lại 1 Constructor duy nhất này
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

    // Các hàm custom thay _dbSet thành _context.Users
    public Task<NguoiDung?> GetByEmailAsync(string email) =>
        _context.Users.FirstOrDefaultAsync(x => x.Email == email);

    public Task<bool> EmailDaTonTaiAsync(string email) =>
        _context.Users.AnyAsync(x => x.Email == email);

    public Task<bool> SoDienThoaiDaTonTaiAsync(string soDienThoai) =>
        _context.Users.AnyAsync(x => x.SoDienThoai == soDienThoai);
}