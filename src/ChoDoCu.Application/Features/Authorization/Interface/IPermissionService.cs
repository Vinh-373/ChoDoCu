
using ChoDoCu.Application.Features.Authorization.DTOs;

namespace ChoDoCu.Application.Features.Authorization.Interfaces;

public interface IPermissionService
{
    Task<IReadOnlyList<PermissionDto>> GetAllAsync();

    Task<IReadOnlyList<PermissionGroupDto>> GetByGroupAsync();
}
