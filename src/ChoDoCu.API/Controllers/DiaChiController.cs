using ChoDoCu.Application.Features.Location.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/dia-chi")]
public class DiaChiController : ControllerBase
{
    private readonly IDiaChiService _service;
    public DiaChiController(IDiaChiService service) => _service = service;

    [HttpGet("thanh-pho")]
    public async Task<IActionResult> DanhSachThanhPho() => Ok(await _service.DanhSachThanhPhoAsync());

    [HttpGet("thanh-pho/{idThanhPho:int}/phuong-xa")]
    public async Task<IActionResult> DanhSachPhuongXa(int idThanhPho)
        => Ok(await _service.DanhSachPhuongXaAsync(idThanhPho));
}
