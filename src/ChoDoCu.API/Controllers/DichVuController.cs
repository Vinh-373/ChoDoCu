using ChoDoCu.Application.Features.Service.DTOs;
using ChoDoCu.Application.Features.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;
using ChoDoCu.API.Authorization;
using ChoDoCu.Domain.Constants;
namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/dich-vu")]
public class DichVuController : ControllerBase
{
    private readonly IDichVuService _service;
    public DichVuController(IDichVuService service) => _service = service;

    // Lấy danh sách các gói dịch vụ đang hoạt động
    [HttpGet]
    public async Task<IActionResult> DanhSach() => Ok(await _service.DanhSachAsync());

    // Lấy danh sách các gói dịch vụ cho quản trị viên (Admin)
    [HasPermission(AppPermissions.DichVuXem)]
    [HttpGet("quan-tri")]
    public async Task<IActionResult> DanhSachQuanTri()
        => Ok(await _service.DanhSachQuanTriAsync());

    // Tạo mới một gói dịch vụ
    [HasPermission(AppPermissions.DichVuThem)]
    [HttpPost ]
    public async Task<IActionResult> Tao(TaoDichVuRequest request)
        => Ok(await _service.TaoAsync(request));

    // Cập nhật thông tin gói dịch vụ
    [HasPermission(AppPermissions.DichVuSua)]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> CapNhat(int id, CapNhatDichVuRequest request)
        => Ok(await _service.CapNhatAsync(id, request));

    // Ngừng bán một gói dịch vụ (thay đổi trạng thái thành "NgungHoatDong")
    [HasPermission(AppPermissions.DichVuXoa)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> NgungBan(int id)
    {
        await _service.XoaAsync(id);
        return NoContent();
    }
}
