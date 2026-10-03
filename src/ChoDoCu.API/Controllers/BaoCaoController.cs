using System.Security.Claims;
using ChoDoCu.Application.Features.Report.DTOs;
using ChoDoCu.Application.Features.Report.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/bao-cao")]
public class BaoCaoController : ControllerBase
{
    private readonly IBaoCaoService _service;
    public BaoCaoController(IBaoCaoService service) => _service = service;

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Tao(TaoBaoCaoRequest request)
        => Ok(await _service.TaoAsync(GetUserId(), request));

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> DanhSach(
        [FromQuery] string? trangThai, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        => Ok(await _service.DanhSachAsync(trangThai, page, pageSize));

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}/xu-ly")]
    public async Task<IActionResult> XuLy(int id, [FromQuery] string trangThaiMoi)
    {
        await _service.XuLyAsync(id, trangThaiMoi);
        return NoContent();
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
