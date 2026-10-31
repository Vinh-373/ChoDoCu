using ChoDoCu.API.Authorization;
using ChoDoCu.Application.Features.Admin.DTOs;
using ChoDoCu.Application.Features.Admin.Interfaces;
using ChoDoCu.Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/admin")]
[HasPermission(AppPermissions.SanPhamQuanLy)]
public sealed class AdminCatalogController : ControllerBase
{
    private readonly IAdminCatalogService _service;

    public AdminCatalogController(IAdminCatalogService service) => _service = service;

    [HttpGet("san-pham")]
    public async Task<IActionResult> ListProducts(
        [FromQuery] string? keyword, [FromQuery] int? idDanhMuc, [FromQuery] int? idHang,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        => Ok(await _service.ListProductsAsync(keyword, idDanhMuc, idHang, page, pageSize));

    [HttpPost("san-pham")]
    public async Task<IActionResult> CreateProduct(TaoSanPhamRequest request)
        => Ok(await _service.CreateProductAsync(request));

    [HttpPut("san-pham/{id:int}")]
    public async Task<IActionResult> UpdateProduct(int id, TaoSanPhamRequest request)
        => Ok(await _service.UpdateProductAsync(id, request));

    [HttpDelete("san-pham/{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        await _service.DeleteProductAsync(id);
        return NoContent();
    }

    [HttpGet("hang")]
    public async Task<IActionResult> ListBrands(
        [FromQuery] string? keyword, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        => Ok(await _service.ListBrandsAsync(keyword, page, pageSize));

    [HttpPost("hang")]
    public async Task<IActionResult> CreateBrand(TaoHangRequest request)
        => Ok(await _service.CreateBrandAsync(request));

    [HttpPut("hang/{id:int}")]
    public async Task<IActionResult> UpdateBrand(int id, TaoHangRequest request)
        => Ok(await _service.UpdateBrandAsync(id, request));

    [HttpDelete("hang/{id:int}")]
    public async Task<IActionResult> DeleteBrand(int id)
    {
        await _service.DeleteBrandAsync(id);
        return NoContent();
    }

    [HttpGet("thuoc-tinh")]
    public async Task<IActionResult> ListAttributes(
        [FromQuery] string? keyword, [FromQuery] int? idDanhMuc,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        => Ok(await _service.ListAttributesAsync(keyword, idDanhMuc, page, pageSize));

    [HttpPost("thuoc-tinh")]
    public async Task<IActionResult> CreateAttribute(TaoThuocTinhRequest request)
        => Ok(await _service.CreateAttributeAsync(request));

    [HttpPut("thuoc-tinh/{id:int}")]
    public async Task<IActionResult> UpdateAttribute(int id, TaoThuocTinhRequest request)
        => Ok(await _service.UpdateAttributeAsync(id, request));

    [HttpDelete("thuoc-tinh/{id:int}")]
    public async Task<IActionResult> DeleteAttribute(int id)
    {
        await _service.DeleteAttributeAsync(id);
        return NoContent();
    }
}
