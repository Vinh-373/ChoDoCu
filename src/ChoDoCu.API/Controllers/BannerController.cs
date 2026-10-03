using ChoDoCu.Application.Features.Banner.DTOs;
using ChoDoCu.Application.Features.Banner.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/banner")]
public class BannerController : ControllerBase
{
    private readonly IBannerService _service;
    public BannerController(IBannerService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> DanhSach([FromQuery] string? viTri) => Ok(await _service.DanhSachAsync(viTri));

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Tao(TaoBannerRequest request) => Ok(await _service.TaoAsync(request));

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Xoa(int id)
    {
        await _service.XoaAsync(id);
        return NoContent();
    }
}
