using ChoDoCu.Application.Features.Authorization.DTOs;
using ChoDoCu.Application.Features.Authorization.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace ChoDoCu.Application.Features.Authorization.Services;

public class RoleService : IRoleService
{
    private readonly RoleManager<IdentityRole<int>> _roleManager;

    public RoleService(RoleManager<IdentityRole<int>> roleManager)
    {
        _roleManager = roleManager;
    }

    public Task<IReadOnlyList<RoleDto>> GetAllAsync()
    {
        var roles = _roleManager.Roles
            .OrderBy(r => r.Name)
            .ToList();

        IReadOnlyList<RoleDto> result = roles
            .Select(r => new RoleDto(
                r.Id,
                r.Name ?? string.Empty
            ))
            .ToList();

        return Task.FromResult(result);
    }

    public async Task<RoleDto?> GetByIdAsync(string id)
    {
        if (!int.TryParse(id, out var roleId))
            return null;

        var role = await _roleManager.FindByIdAsync(roleId.ToString());

        if (role == null)
            return null;

        return new RoleDto(
            role.Id,
            role.Name ?? string.Empty
        );
    }

    public async Task<RoleDto> CreateAsync(CreateRoleRequest request)
    {
        var tenVaiTro = request.TenVaiTro?.Trim();

        if (string.IsNullOrWhiteSpace(tenVaiTro))
            throw new InvalidOperationException("Tên vai trò không được để trống.");

        var existingRole = await _roleManager.FindByNameAsync(tenVaiTro);

        if (existingRole != null)
            throw new InvalidOperationException("Vai trò đã tồn tại.");

        var role = new IdentityRole<int>
        {
            Name = tenVaiTro
        };

        var result = await _roleManager.CreateAsync(role);

        if (!result.Succeeded)
        {
            var errors = string.Join(
                "; ",
                result.Errors.Select(e => e.Description));

            throw new InvalidOperationException(errors);
        }

        return new RoleDto(role.Id, role.Name ?? string.Empty);
    }

    public async Task<bool> UpdateAsync(
        string id,
        UpdateRoleRequest request)
    {
        if (!int.TryParse(id, out var roleId))
            return false;

        var role = await _roleManager.FindByIdAsync(roleId.ToString());

        if (role == null)
            return false;

        var tenVaiTro = request.TenVaiTro?.Trim();

        if (string.IsNullOrWhiteSpace(tenVaiTro))
            throw new InvalidOperationException("Tên vai trò không được để trống.");

        var existingRole = await _roleManager.FindByNameAsync(tenVaiTro);

        if (existingRole != null && existingRole.Id != role.Id)
            throw new InvalidOperationException("Tên vai trò đã được sử dụng.");

        role.Name = tenVaiTro;

        var result = await _roleManager.UpdateAsync(role);

        if (!result.Succeeded)
        {
            var errors = string.Join(
                "; ",
                result.Errors.Select(e => e.Description));

            throw new InvalidOperationException(errors);
        }

        return true;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        if (!int.TryParse(id, out var roleId))
            return false;

        var role = await _roleManager.FindByIdAsync(roleId.ToString());

        if (role == null)
            return false;

        var result = await _roleManager.DeleteAsync(role);

        if (!result.Succeeded)
        {
            var errors = string.Join(
                "; ",
                result.Errors.Select(e => e.Description));

            throw new InvalidOperationException(errors);
        }

        return true;
    }
}