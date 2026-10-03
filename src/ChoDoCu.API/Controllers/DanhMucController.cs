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

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Tao(TaoDanhMucRequest request) => Ok(await _service.TaoAsync(request));

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> CapNhat(int id, CapNhatDanhMucRequest request)
        => Ok(await _service.CapNhatAsync(id, request));

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Xoa(int id)
    {
        await _service.XoaAsync(id);
        return NoContent();
    }
}
