using System.Security.Claims;
using ChoDoCu.Application.Features.Search.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/tim-kiem")]
[Authorize]
public class TimKiemController : ControllerBase
{
    private readonly ITimKiemService _service;
    public TimKiemController(ITimKiemService service) => _service = service;

    [HttpGet("lich-su")]
    public async Task<IActionResult> LichSu([FromQuery] int soLuong = 10)
        => Ok(await _service.LichSuGanNhatAsync(GetUserId(), soLuong));

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
