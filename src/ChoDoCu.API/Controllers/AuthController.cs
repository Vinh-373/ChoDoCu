using ChoDoCu.Application.Features.Auth.DTOs;
using ChoDoCu.Application.Features.Auth.Interfaces;
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
}
