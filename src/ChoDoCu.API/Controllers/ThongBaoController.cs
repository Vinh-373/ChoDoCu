using System.Security.Claims;
using ChoDoCu.Application.Features.Notification.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/thong-bao")]
[Authorize]
public class ThongBaoController : ControllerBase
{
    private readonly IThongBaoService _service;
    public ThongBaoController(IThongBaoService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> DanhSach([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        => Ok(await _service.DanhSachAsync(GetUserId(), page, pageSize));

    [HttpGet("dem-chua-doc")]
    public async Task<IActionResult> DemChuaDoc() => Ok(new { soLuong = await _service.DemChuaDocAsync(GetUserId()) });

    [HttpPut("{id:int}/da-doc")]
    public async Task<IActionResult> DanhDauDaDoc(int id)
    {
        await _service.DanhDauDaDocAsync(GetUserId(), id);
        return NoContent();
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
