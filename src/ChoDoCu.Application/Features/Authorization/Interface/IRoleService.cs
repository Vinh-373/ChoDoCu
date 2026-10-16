
using ChoDoCu.Application.Features.Authorization.DTOs;

namespace ChoDoCu.Application.Features.Authorization.Interfaces;

public interface IRoleService
{
    Task<IReadOnlyList<RoleDto>> GetAllAsync();

    Task<RoleDto?> GetByIdAsync(string id);

    Task<RoleDto> CreateAsync(CreateRoleRequest request);

    Task<bool> UpdateAsync(string id, UpdateRoleRequest request);

    Task<bool> DeleteAsync(string id);
}
