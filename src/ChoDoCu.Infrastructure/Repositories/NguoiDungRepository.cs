using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class NguoiDungRepository : Repository<NguoiDung>, INguoiDungRepository
{
    public NguoiDungRepository(ApplicationDbContext context) : base(context) { }

    public Task<NguoiDung?> GetByEmailAsync(string email) =>
        _dbSet.FirstOrDefaultAsync(x => x.Email == email);

    public Task<bool> EmailDaTonTaiAsync(string email) =>
        _dbSet.AnyAsync(x => x.Email == email);

    public Task<bool> SoDienThoaiDaTonTaiAsync(string soDienThoai) =>
        _dbSet.AnyAsync(x => x.SoDienThoai == soDienThoai);
}
