
using ChoDoCu.Application.Features.Authorization.DTOs;

namespace ChoDoCu.Application.Features.Authorization.Interfaces;

public interface IRolePermissionService
{
    Task<RolePermissionDto?> GetByRoleAsync(string roleId);

    Task<bool> UpdateAsync(
        string roleId,
        List<string> permissionCodes);
}
