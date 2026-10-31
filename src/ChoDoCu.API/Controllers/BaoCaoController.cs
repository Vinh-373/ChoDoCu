using ChoDoCu.Domain.Constants;
using ChoDoCu.API.Authorization;
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
        => StatusCode(StatusCodes.Status201Created, await _service.TaoAsync(GetUserId(), request));

    [HasPermission(AppPermissions.BaoCaoXuLy)]
    [HttpGet]
    public async Task<IActionResult> DanhSach(
        [FromQuery] string? trangThai, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        => Ok(await _service.DanhSachAsync(trangThai, page, pageSize));

    [HasPermission(AppPermissions.BaoCaoXuLy)]
    [HttpPut("{id:int}/xu-ly")]
    public async Task<IActionResult> XuLy(int id, [FromQuery] string trangThaiMoi)
    {
        await _service.XuLyAsync(id, trangThaiMoi);
        return NoContent();
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
