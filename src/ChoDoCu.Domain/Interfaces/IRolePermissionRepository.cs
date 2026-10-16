using System.Security.Claims;

namespace ChoDoCu.Domain.Interfaces.Repositories.Authorization;

public interface IRolePermissionRepository
{
    Task<bool> RoleExistsAsync(int roleId);

    Task<IReadOnlyList<Claim>> GetClaimsByRoleAsync(int roleId);
}