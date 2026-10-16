using ChoDoCu.Application.Features.Authorization.DTOs;
using ChoDoCu.Application.Features.Authorization.Interfaces;
using ChoDoCu.Domain.Constants;

namespace ChoDoCu.Application.Features.Authorization.Services;

public class PermissionService : IPermissionService
{
    public Task<IReadOnlyList<PermissionDto>> GetAllAsync()
    {
        IReadOnlyList<PermissionDto> permissions = AppPermissions.All
            .Select((p, index) => new PermissionDto(
                index + 1,
                p.Ma,
                p.Ten,
                p.Ma.Split('.')[0]))
            .ToList();

        return Task.FromResult(permissions);
    }

    public Task<IReadOnlyList<PermissionGroupDto>> GetByGroupAsync()
    {
        IReadOnlyList<PermissionGroupDto> groups = AppPermissions.All
            .GroupBy(p => p.Ma.Split('.')[0])
            .Select(g => new PermissionGroupDto(
                g.Key,
                g.Select(p => new PermissionDto(
                    0,
                    p.Ma,
                    p.Ten,
                    g.Key)).ToList()))
            .ToList();

        return Task.FromResult(groups);
    }
}