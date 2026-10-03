using System.Security.Claims;
using ChoDoCu.Application.Features.Favorite.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/yeu-thich")]
[Authorize]
public class YeuThichController : ControllerBase
{
    private readonly IYeuThichService _service;
    public YeuThichController(IYeuThichService service) => _service = service;

    // POST api/yeu-thich/5  (idBaiDang) -> bật/tắt yêu thích
    [HttpPost("{idBaiDang:int}")]
    public async Task<IActionResult> Toggle(int idBaiDang)
    {
        var daThich = await _service.ToggleAsync(GetUserId(), idBaiDang);
        return Ok(new { daThich });
    }

    [HttpGet]
    public async Task<IActionResult> DanhSach([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        => Ok(await _service.DanhSachAsync(GetUserId(), page, pageSize));

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
