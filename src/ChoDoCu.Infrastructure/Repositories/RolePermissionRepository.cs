using System.Security.Claims;
using ChoDoCu.Domain.Interfaces.Repositories.Authorization;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories.Authorization;

public class RolePermissionRepository : IRolePermissionRepository
{
    private readonly ApplicationDbContext _context;

    public RolePermissionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<bool> RoleExistsAsync(int roleId)
    {
        return _context.Roles
            .AnyAsync(r => r.Id == roleId);
    }

    public async Task<IReadOnlyList<Claim>> GetClaimsByRoleAsync(
        int roleId)
    {
        var claims = await _context.RoleClaims
            .AsNoTracking()
            .Where(c => c.RoleId == roleId)
            .Select(c => new
            {
                c.ClaimType,
                c.ClaimValue
            })
            .ToListAsync();

        return claims
            .Where(c => c.ClaimType != null && c.ClaimValue != null)
            .Select(c => new Claim(c.ClaimType!, c.ClaimValue!))
            .ToList();
    }
}
