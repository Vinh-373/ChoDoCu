using ChoDoCu.Application.Features.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/dich-vu")]
public class DichVuController : ControllerBase
{
    private readonly IDichVuService _service;
    public DichVuController(IDichVuService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> DanhSach() => Ok(await _service.DanhSachAsync());
}
