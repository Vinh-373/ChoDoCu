using ChoDoCu.Domain.Constants;
using ChoDoCu.API.Authorization;
using ChoDoCu.Application.Features.Category.DTOs;
using ChoDoCu.Application.Features.Category.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/danh-muc")]
public class DanhMucController : ControllerBase
{
    private readonly IDanhMucService _service;
    public DanhMucController(IDanhMucService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetCay() => Ok(await _service.GetCayDanhMucAsync());

    [HttpGet("{id:int}/thuoc-tinh")]
    public async Task<IActionResult> GetThuocTinh(int id, [FromQuery] int? idHang)
        => Ok(await _service.GetThuocTinhDanhMucAsync(id, idHang));

    [HasPermission(AppPermissions.DanhMucQuanLy)]
    [HttpPost]
    public async Task<IActionResult> Tao(TaoDanhMucRequest request)
        => StatusCode(StatusCodes.Status201Created, await _service.TaoAsync(request));

    [HasPermission(AppPermissions.DanhMucQuanLy)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> CapNhat(int id, CapNhatDanhMucRequest request)
        => Ok(await _service.CapNhatAsync(id, request));

    [HasPermission(AppPermissions.DanhMucQuanLy)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Xoa(int id)
    {
        await _service.XoaAsync(id);
        return NoContent();
    }
}
