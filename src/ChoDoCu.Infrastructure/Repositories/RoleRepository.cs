using ChoDoCu.Domain.Interfaces.Repositories.Authorization;
using ChoDoCu.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories.Authorization;

public class RoleRepository : IRoleRepository
{
    private readonly ApplicationDbContext _context;

    public RoleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<IdentityRole<int>>> GetAllAsync()
    {
        return await _context.Roles
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .ToListAsync();
    }

    public Task<IdentityRole<int>?> GetByIdAsync(int id)
    {
        return _context.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public Task<bool> ExistsByNameAsync(string name)
    {
        var normalizedName = name.Trim().ToUpperInvariant();

        return _context.Roles.AnyAsync(
            r => r.NormalizedName == normalizedName);
    }
}