using ChoDoCu.API.Authorization;
using ChoDoCu.Application.Features.Authorization.DTOs;
using ChoDoCu.Application.Features.Authorization.Interfaces;
using ChoDoCu.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers.Admin;

[ApiController]
[Route("api/admin/roles/{roleId}/permissions")]
[Authorize]
[HasPermission(AppPermissions.PhanQuyenQuanLy)]
public class RolePermissionsController : ControllerBase
{
    private readonly IRolePermissionService _rolePermissionService;

    public RolePermissionsController(
        IRolePermissionService rolePermissionService)
    {
        _rolePermissionService = rolePermissionService;
    }

    // GET: api/admin/roles/{roleId}/permissions
    [HttpGet]
    public async Task<IActionResult> GetByRole(string roleId)
    {
        var result = await _rolePermissionService.GetByRoleAsync(roleId);

        if (result == null)
            return NotFound(new { message = "Không tìm thấy vai trò." });

        return Ok(result);
    }

    // PUT: api/admin/roles/{roleId}/permissions
    // Thay thế toàn bộ quyền hiện tại bằng danh sách mới
    [HttpPut]
    public async Task<IActionResult> Update(
        string roleId,
        [FromBody] UpdateRolePermissionsRequest request)
    {
        var result = await _rolePermissionService.UpdateAsync(
            roleId,
            request.PermissionCodes);

        if (!result)
            return NotFound(new { message = "Không tìm thấy vai trò." });

        return NoContent();
    }
}
