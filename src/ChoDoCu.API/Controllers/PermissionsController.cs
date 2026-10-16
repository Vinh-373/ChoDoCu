using ChoDoCu.API.Authorization;
using ChoDoCu.Application.Features.Authorization.Interfaces;
using ChoDoCu.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers.Admin;

[ApiController]
[Route("api/admin/permissions")]
[Authorize]
[HasPermission(AppPermissions.PhanQuyenQuanLy)]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;

    public PermissionsController(IPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    // GET: api/admin/permissions
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _permissionService.GetAllAsync());
    }

    // GET: api/admin/permissions/nhom
    [HttpGet("nhom")]
    public async Task<IActionResult> GetByGroup()
    {
        return Ok(await _permissionService.GetByGroupAsync());
    }
}
