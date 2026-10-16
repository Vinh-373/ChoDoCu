using System.Security.Claims;
using ChoDoCu.API.Authorization;
using ChoDoCu.Application.Features.Account.DTOs;
using ChoDoCu.Application.Features.Account.Interfaces;
using ChoDoCu.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/nguoi-dung")]
public class NguoiDungController : ControllerBase
{
    private readonly INguoiDungService _service;
    public NguoiDungController(INguoiDungService service) => _service = service;

    // ----- Hồ sơ cá nhân -----

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
        => Ok(await _service.GetHoSoAsync(GetUserId()));

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> CapNhatMe(CapNhatHoSoRequest request)
        => Ok(await _service.CapNhatHoSoAsync(GetUserId(), request));

    // ----- Quản trị -----

    /// <summary>GET /api/nguoi-dung?keyword=an&amp;trangThai=Khoa&amp;role=User&amp;page=1&amp;pageSize=20</summary>
    [HasPermission(AppPermissions.NguoiDungXem)]
    [HttpGet]
    public async Task<IActionResult> DanhSach(
        [FromQuery] string? keyword,
        [FromQuery] string? trangThai,
        [FromQuery] string? role,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _service.DanhSachAsync(keyword, trangThai, role, page, pageSize));

    [HasPermission(AppPermissions.NguoiDungKhoa)]
    [HttpPut("{id:int}/khoa")]
    public async Task<IActionResult> Khoa(int id)
    {
        await _service.KhoaAsync(GetUserId(), id);
        return NoContent();
    }

    [HasPermission(AppPermissions.NguoiDungKhoa)]
    [HttpPut("{id:int}/mo-khoa")]
    public async Task<IActionResult> MoKhoa(int id)
    {
        await _service.MoKhoaAsync(id);
        return NoContent();
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
