using System.Security.Claims;
using ChoDoCu.Application.Features.Post.DTOs;
using ChoDoCu.Application.Features.Post.Interfaces;
using ChoDoCu.Application.Features.Search.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/bai-dang")]
public class BaiDangController : ControllerBase
{
    private readonly IBaiDangService _baiDangService;
    private readonly ITimKiemService _timKiemService;

    public BaiDangController(IBaiDangService baiDangService, ITimKiemService timKiemService)
    {
        _baiDangService = baiDangService;
        _timKiemService = timKiemService;
    }

    [HttpGet]
    public async Task<IActionResult> TimKiem(
        [FromQuery] int? idDanhMuc, [FromQuery] int? idThanhPho, [FromQuery] string? tuKhoa,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var ketQua = await _baiDangService.TimKiemAsync(idDanhMuc, idThanhPho, tuKhoa, page, pageSize);

        if (User.Identity?.IsAuthenticated == true && !string.IsNullOrWhiteSpace(tuKhoa))
            await _timKiemService.GhiLaiAsync(GetUserId(), tuKhoa);

        return Ok(ketQua);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetChiTiet(int id)
    {
        int? idNguoiXem = User.Identity?.IsAuthenticated == true ? GetUserId() : null;
        return Ok(await _baiDangService.GetChiTietAsync(id, idNguoiXem, User.IsInRole("Admin")));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Tao(TaoBaiDangRequest request)
    {
        var ketQua = await _baiDangService.TaoAsync(GetUserId(), request);
        return CreatedAtAction(nameof(GetChiTiet), new { id = ketQua.Id }, ketQua);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}/duyet")]
    public async Task<IActionResult> Duyet(int id)
    {
        await _baiDangService.DuyetAsync(id);
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}/tu-choi")]
    public async Task<IActionResult> TuChoi(int id)
    {
        await _baiDangService.TuChoiAsync(id);
        return NoContent();
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}