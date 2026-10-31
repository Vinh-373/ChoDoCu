using System.Security.Claims;
using ChoDoCu.Application.Features.Authorization.DTOs;
using ChoDoCu.Application.Features.Authorization.Interfaces;
using ChoDoCu.Domain.Constants;
using ChoDoCu.Domain.Exceptions;
using Microsoft.AspNetCore.Identity;

namespace ChoDoCu.Application.Features.Authorization.Services;

public class RolePermissionService : IRolePermissionService
{
    private readonly RoleManager<IdentityRole<int>> _roleManager;

    public RolePermissionService(
        RoleManager<IdentityRole<int>> roleManager)
    {
        _roleManager = roleManager;
    }

    public async Task<RolePermissionDto?> GetByRoleAsync(string roleId)
    {
        var role = await _roleManager.FindByIdAsync(roleId);

        if (role == null)
            return null;

        var claims = await _roleManager.GetClaimsAsync(role);

        var permissionCodes = claims
            .Where(c => c.Type == AppPermissions.ClaimType)
            .Select(c => c.Value)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var permissions = AppPermissions.All
            .Select((p, index) => new PermissionDto(
                index + 1,
                p.Ma,
                p.Ten,
                p.Ma.Split('.')[0]))
            .Where(p => permissionCodes.Contains(p.MaChucNang))
            .ToList();

        return new RolePermissionDto(
            role.Id,
            role.Name ?? string.Empty,
            role.Name ?? string.Empty,
            permissions);
    }

    public async Task<bool> UpdateAsync(
        string roleId,
        List<string> permissionCodes)
    {
        var role = await _roleManager.FindByIdAsync(roleId);

        if (role == null)
            return false;

        permissionCodes ??= new List<string>();

        // Chi chap nhan cac quyen da khai bao trong AppPermissions.All.
        var validCodes = AppPermissions.All
            .Select(p => p.Ma)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var selectedCodes = permissionCodes
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .Select(p => p.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var invalidCodes = selectedCodes
            .Where(p => !validCodes.Contains(p))
            .ToList();

        if (invalidCodes.Count > 0)
        {
            throw new DomainException(
                $"Mã quyền không hợp lệ: {string.Join(", ", invalidCodes)}");
        }

        var currentClaims = await _roleManager.GetClaimsAsync(role);

        // Chi xoa cac claim quyen, giu lai cac claim loai khac.
        var oldPermissionClaims = currentClaims
            .Where(c => c.Type == AppPermissions.ClaimType)
            .ToList();

        foreach (var claim in oldPermissionClaims)
        {
            var result = await _roleManager.RemoveClaimAsync(role, claim);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    "; ",
                    result.Errors.Select(e => e.Description));

                throw new InvalidOperationException(errors);
            }
        }

        foreach (var code in selectedCodes)
        {
            var claim = new Claim(AppPermissions.ClaimType, code);

            var result = await _roleManager.AddClaimAsync(role, claim);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    "; ",
                    result.Errors.Select(e => e.Description));

                throw new InvalidOperationException(errors);
            }
        }

        return true;
    }
}
