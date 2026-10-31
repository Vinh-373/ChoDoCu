using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Admin.DTOs;

namespace ChoDoCu.Application.Features.Admin.Interfaces;

public interface IAdminDashboardService
{
    Task<AdminDashboardResponse> GetDashboardAsync();
}

public interface IAdminCatalogService
{
    Task<PagedResult<SanPhamAdminResponse>> ListProductsAsync(
        string? keyword, int? idDanhMuc, int? idHang, int page, int pageSize);
    Task<SanPhamAdminResponse> CreateProductAsync(TaoSanPhamRequest request);
    Task<SanPhamAdminResponse> UpdateProductAsync(int id, TaoSanPhamRequest request);
    Task DeleteProductAsync(int id);

    Task<PagedResult<HangAdminResponse>> ListBrandsAsync(string? keyword, int page, int pageSize);
    Task<HangAdminResponse> CreateBrandAsync(TaoHangRequest request);
    Task<HangAdminResponse> UpdateBrandAsync(int id, TaoHangRequest request);
    Task DeleteBrandAsync(int id);

    Task<PagedResult<ThuocTinhAdminResponse>> ListAttributesAsync(
        string? keyword, int? idDanhMuc, int page, int pageSize);
    Task<ThuocTinhAdminResponse> CreateAttributeAsync(TaoThuocTinhRequest request);
    Task<ThuocTinhAdminResponse> UpdateAttributeAsync(int id, TaoThuocTinhRequest request);
    Task DeleteAttributeAsync(int id);
}
