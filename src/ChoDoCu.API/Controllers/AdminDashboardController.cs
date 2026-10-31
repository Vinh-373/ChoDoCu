using ChoDoCu.API.Authorization;
using ChoDoCu.Application.Features.Admin.Interfaces;
using ChoDoCu.Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[HasPermission(AppPermissions.AdminDashboardXem)]
public sealed class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _service;

    public AdminDashboardController(IAdminDashboardService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _service.GetDashboardAsync());
}
