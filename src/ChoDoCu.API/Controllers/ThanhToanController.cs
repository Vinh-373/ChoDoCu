using System.Security.Claims;
using ChoDoCu.Application.Features.Payment.DTOs;
using ChoDoCu.Application.Features.Payment.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/thanh-toan")]
public class ThanhToanController : ControllerBase
{
    private readonly IThanhToanService _service;
    public ThanhToanController(IThanhToanService service) => _service = service;

    [Authorize]
    [HttpPost("mua-dich-vu")]
    public async Task<IActionResult> MuaDichVu(MuaDichVuRequest request)
        => Ok(await _service.MuaDichVuAsync(GetUserId(), request));

    // Tạm thời chỉ Admin được xác nhận. Khi tích hợp VNPay/Momo, đổi thành webhook
    // xác thực bằng chữ ký callback của cổng thanh toán.
    [Authorize(Roles = "Admin")]
    [HttpPost("xac-nhan")]
    public async Task<IActionResult> XacNhan(XacNhanThanhToanRequest request)
    {
        await _service.XacNhanAsync(request);
        return NoContent();
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}