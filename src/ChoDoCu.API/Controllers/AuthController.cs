using System.Security.Claims;
using ChoDoCu.Application.Features.Auth.DTOs;
using ChoDoCu.Application.Features.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("dang-ky")]
    public async Task<IActionResult> DangKy(DangKyRequest request)
    {
        var result = await _authService.DangKyAsync(request);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(new { message = result.Error });
    }

    [HttpPost("dang-nhap")]
    public async Task<IActionResult> DangNhap(DangNhapRequest request)
    {
        var result = await _authService.DangNhapAsync(request);
        return result.IsSuccess ? Ok(result.Data) : Unauthorized(new { message = result.Error });
    }

    [Authorize]
    [HttpPost("doi-mat-khau")]
    public async Task<IActionResult> DoiMatKhau(DoiMatKhauRequest request)
    {
        var result = await _authService.DoiMatKhauAsync(GetUserId(), request);
        return result.IsSuccess
            ? Ok(new { message = "Đổi mật khẩu thành công." })
            : BadRequest(new { message = result.Error });
    }

    [HttpPost("quen-mat-khau")]
    public async Task<IActionResult> QuenMatKhau(QuenMatKhauRequest request)
    {
        await _authService.QuenMatKhauAsync(request);

        // Luôn trả cùng một thông báo dù email có tồn tại hay không.
        return Ok(new { message = "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." });
    }

    [HttpPost("dat-lai-mat-khau")]
    public async Task<IActionResult> DatLaiMatKhau(DatLaiMatKhauRequest request)
    {
        var result = await _authService.DatLaiMatKhauAsync(request);
        return result.IsSuccess
            ? Ok(new { message = "Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới." })
            : BadRequest(new { message = result.Error });
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
