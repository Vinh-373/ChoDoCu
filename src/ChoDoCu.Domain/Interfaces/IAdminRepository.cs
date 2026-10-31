using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IAdminRepository
{
    Task<(int Users, int Posts, int Transactions, int Reports)> GetDashboardCountsAsync();

    Task<(IReadOnlyList<SanPham> Items, int Total)> ListProductsAsync(
        string? keyword, int? idDanhMuc, int? idHang, int page, int pageSize);
    Task<SanPham?> GetProductAsync(int id);
    Task<SanPham?> GetProductForResponseAsync(int id);
    Task<bool> CategoryExistsAsync(int id);
    Task<bool> BrandExistsAsync(int id);
    Task<bool> ProductLineExistsAsync(int id, int? idHang, int? idDanhMuc);
    Task<bool> SpecificProductLineExistsAsync(int id, int? idDongSanPham);
    Task<bool> ProductHasPostsAsync(int id);
    Task AddProductAsync(SanPham product);
    void RemoveProduct(SanPham product);

    Task<(IReadOnlyList<Hang> Items, int Total)> ListBrandsAsync(string? keyword, int page, int pageSize);
    Task<Hang?> GetBrandAsync(int id);
    Task<bool> BrandHasProductsAsync(int id);
    Task AddBrandAsync(Hang brand);
    void RemoveBrand(Hang brand);

    Task<(IReadOnlyList<ThuocTinhSanPham> Items, int Total)> ListAttributesAsync(
        string? keyword, int? idDanhMuc, int page, int pageSize);
    Task<ThuocTinhSanPham?> GetAttributeAsync(int id);
    Task<bool> AttributeParentExistsAsync(int id);
    Task<bool> AttributeCategoryExistsAsync(int id);
    Task<bool> AttributeHasChildrenAsync(int id);
    Task<bool> AttributeHasProductValuesAsync(int id);
    Task AddAttributeAsync(ThuocTinhSanPham attribute);
    void RemoveAttribute(ThuocTinhSanPham attribute);

    Task<int> SaveChangesAsync();
}
