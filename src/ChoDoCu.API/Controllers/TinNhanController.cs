using System.Security.Claims;
using ChoDoCu.Application.Features.Chat.DTOs;
using ChoDoCu.Application.Features.Chat.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/tin-nhan")]
[Authorize]
public class TinNhanController : ControllerBase
{
    private readonly ITinNhanService _service;
    public TinNhanController(ITinNhanService service) => _service = service;

    [HttpGet("hoi-thoai")]
    public async Task<IActionResult> DanhSachHoiThoai() => Ok(await _service.DanhSachHoiThoaiAsync(GetUserId()));

    [HttpGet("hoi-thoai/{idHoiThoai:int}")]
    public async Task<IActionResult> DanhSachTinNhan(
        int idHoiThoai, [FromQuery] int page = 1, [FromQuery] int pageSize = 30)
        => Ok(await _service.DanhSachTinNhanAsync(GetUserId(), idHoiThoai, page, pageSize));

    [HttpPost]
    public async Task<IActionResult> Gui(GuiTinNhanRequest request)
        => Ok(await _service.GuiAsync(GetUserId(), request));

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
