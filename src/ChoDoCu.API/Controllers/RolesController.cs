using ChoDoCu.API.Authorization;
using ChoDoCu.Application.Features.Authorization.DTOs;
using ChoDoCu.Application.Features.Authorization.Interfaces;
using ChoDoCu.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers.Admin;

[ApiController]
[Route("api/admin/roles")]
[Authorize]
[HasPermission(AppPermissions.PhanQuyenQuanLy)]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    // GET: api/admin/roles
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _roleService.GetAllAsync());
    }

    // GET: api/admin/roles/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var role = await _roleService.GetByIdAsync(id);

        if (role == null)
            return NotFound(new { message = "Không tìm thấy vai trò." });

        return Ok(role);
    }

    // POST: api/admin/roles
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateRoleRequest request)
    {
        var role = await _roleService.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = role.Id },
            role);
    }

    // PUT: api/admin/roles/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        string id,
        [FromBody] UpdateRoleRequest request)
    {
        var result = await _roleService.UpdateAsync(id, request);

        if (!result)
            return NotFound(new { message = "Không tìm thấy vai trò." });

        return NoContent();
    }

    // DELETE: api/admin/roles/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _roleService.DeleteAsync(id);

        if (!result)
            return NotFound(new { message = "Không tìm thấy vai trò." });

        return NoContent();
    }
}
