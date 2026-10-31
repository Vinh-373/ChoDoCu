using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Admin.DTOs;
using ChoDoCu.Application.Features.Admin.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;

namespace ChoDoCu.Application.Features.Admin.Services;

public sealed class AdminCatalogService : IAdminCatalogService
{
    private readonly IAdminRepository _repository;
    private readonly IValidator<TaoSanPhamRequest> _productValidator;
    private readonly IValidator<TaoHangRequest> _brandValidator;
    private readonly IValidator<TaoThuocTinhRequest> _attributeValidator;

    public AdminCatalogService(
        IAdminRepository repository,
        IValidator<TaoSanPhamRequest> productValidator,
        IValidator<TaoHangRequest> brandValidator,
        IValidator<TaoThuocTinhRequest> attributeValidator)
    {
        _repository = repository;
        _productValidator = productValidator;
        _brandValidator = brandValidator;
        _attributeValidator = attributeValidator;
    }

    public async Task<PagedResult<SanPhamAdminResponse>> ListProductsAsync(
        string? keyword, int? idDanhMuc, int? idHang, int page, int pageSize)
    {
        (page, pageSize) = NormalizePaging(page, pageSize);
        var (items, total) = await _repository.ListProductsAsync(keyword, idDanhMuc, idHang, page, pageSize);
        return new PagedResult<SanPhamAdminResponse>(items.Select(ToResponse).ToList(), total, page, pageSize);
    }

    public async Task<SanPhamAdminResponse> CreateProductAsync(TaoSanPhamRequest request)
    {
        await _productValidator.ValidateAndThrowAsync(request);
        await ValidateProductReferencesAsync(request);

        var product = new SanPham();
        Apply(product, request);
        await _repository.AddProductAsync(product);
        await _repository.SaveChangesAsync();
        return ToResponse(await _repository.GetProductForResponseAsync(product.Id) ?? product);
    }

    public async Task<SanPhamAdminResponse> UpdateProductAsync(int id, TaoSanPhamRequest request)
    {
        await _productValidator.ValidateAndThrowAsync(request);
        await ValidateProductReferencesAsync(request);
        var product = await _repository.GetProductAsync(id)
            ?? throw new NotFoundException(nameof(SanPham), id);
        Apply(product, request);
        await _repository.SaveChangesAsync();
        return ToResponse(await _repository.GetProductForResponseAsync(product.Id) ?? product);
    }

    public async Task DeleteProductAsync(int id)
    {
        var product = await _repository.GetProductAsync(id)
            ?? throw new NotFoundException(nameof(SanPham), id);
        if (await _repository.ProductHasPostsAsync(id))
            throw new DomainException("Khong the xoa san pham dang duoc su dung boi bai dang.");
        _repository.RemoveProduct(product);
        await _repository.SaveChangesAsync();
    }

    public async Task<PagedResult<HangAdminResponse>> ListBrandsAsync(string? keyword, int page, int pageSize)
    {
        (page, pageSize) = NormalizePaging(page, pageSize);
        var (items, total) = await _repository.ListBrandsAsync(keyword, page, pageSize);
        return new PagedResult<HangAdminResponse>(items.Select(ToResponse).ToList(), total, page, pageSize);
    }

    public async Task<HangAdminResponse> CreateBrandAsync(TaoHangRequest request)
    {
        await _brandValidator.ValidateAndThrowAsync(request);
        var brand = new Hang();
        Apply(brand, request);
        await _repository.AddBrandAsync(brand);
        await _repository.SaveChangesAsync();
        return ToResponse(brand);
    }

    public async Task<HangAdminResponse> UpdateBrandAsync(int id, TaoHangRequest request)
    {
        await _brandValidator.ValidateAndThrowAsync(request);
        var brand = await _repository.GetBrandAsync(id)
            ?? throw new NotFoundException(nameof(Hang), id);
        Apply(brand, request);
        await _repository.SaveChangesAsync();
        return ToResponse(brand);
    }

    public async Task DeleteBrandAsync(int id)
    {
        var brand = await _repository.GetBrandAsync(id)
            ?? throw new NotFoundException(nameof(Hang), id);
        if (await _repository.BrandHasProductsAsync(id))
            throw new DomainException("Khong the xoa hang dang duoc san pham hoac dong san pham su dung.");
        _repository.RemoveBrand(brand);
        await _repository.SaveChangesAsync();
    }

    public async Task<PagedResult<ThuocTinhAdminResponse>> ListAttributesAsync(
        string? keyword, int? idDanhMuc, int page, int pageSize)
    {
        (page, pageSize) = NormalizePaging(page, pageSize);
        var (items, total) = await _repository.ListAttributesAsync(keyword, idDanhMuc, page, pageSize);
        return new PagedResult<ThuocTinhAdminResponse>(items.Select(ToResponse).ToList(), total, page, pageSize);
    }

    public async Task<ThuocTinhAdminResponse> CreateAttributeAsync(TaoThuocTinhRequest request)
    {
        await _attributeValidator.ValidateAndThrowAsync(request);
        await ValidateAttributeReferencesAsync(request, null);
        var attribute = new ThuocTinhSanPham();
        Apply(attribute, request);
        await _repository.AddAttributeAsync(attribute);
        await _repository.SaveChangesAsync();
        return ToResponse(attribute);
    }

    public async Task<ThuocTinhAdminResponse> UpdateAttributeAsync(int id, TaoThuocTinhRequest request)
    {
        await _attributeValidator.ValidateAndThrowAsync(request);
        var attribute = await _repository.GetAttributeAsync(id)
            ?? throw new NotFoundException(nameof(ThuocTinhSanPham), id);
        await ValidateAttributeReferencesAsync(request, id);
        Apply(attribute, request);
        await _repository.SaveChangesAsync();
        return ToResponse(attribute);
    }

    public async Task DeleteAttributeAsync(int id)
    {
        var attribute = await _repository.GetAttributeAsync(id)
            ?? throw new NotFoundException(nameof(ThuocTinhSanPham), id);
        if (await _repository.AttributeHasChildrenAsync(id))
            throw new DomainException("Khong the xoa thuoc tinh dang co thuoc tinh con.");
        if (await _repository.AttributeHasProductValuesAsync(id))
            throw new DomainException("Khong the xoa thuoc tinh dang duoc san pham su dung.");
        _repository.RemoveAttribute(attribute);
        await _repository.SaveChangesAsync();
    }

    private async Task ValidateProductReferencesAsync(TaoSanPhamRequest request)
    {
        if (!await _repository.CategoryExistsAsync(request.IdDanhMuc))
            throw new NotFoundException(nameof(Domain.Entities.DanhMuc), request.IdDanhMuc);
        if (request.IdHang.HasValue && !await _repository.BrandExistsAsync(request.IdHang.Value))
            throw new NotFoundException(nameof(Hang), request.IdHang.Value);
        if (request.IdDongSanPham.HasValue &&
            !await _repository.ProductLineExistsAsync(request.IdDongSanPham.Value, request.IdHang, request.IdDanhMuc))
            throw new DomainException("Dong san pham khong thuoc hang hoac danh muc da chon.");
        if (request.IdDongCuThe.HasValue &&
            (!request.IdDongSanPham.HasValue ||
             !await _repository.SpecificProductLineExistsAsync(request.IdDongCuThe.Value, request.IdDongSanPham)))
            throw new DomainException("Dong cu the khong thuoc dong san pham da chon.");
    }

    private async Task ValidateAttributeReferencesAsync(TaoThuocTinhRequest request, int? updatingId)
    {
        if (request.IdDanhMuc.HasValue && !await _repository.AttributeCategoryExistsAsync(request.IdDanhMuc.Value))
            throw new NotFoundException(nameof(Domain.Entities.DanhMuc), request.IdDanhMuc.Value);

        if (!request.IdThuocTinhCha.HasValue)
            return;

        var parentId = request.IdThuocTinhCha.Value;
        if (updatingId == parentId)
            throw new DomainException("Thuoc tinh khong the la cha cua chinh no.");
        if (!await _repository.AttributeParentExistsAsync(parentId))
            throw new NotFoundException(nameof(ThuocTinhSanPham), parentId);

        var seen = new HashSet<int>();
        var current = parentId;
        while (seen.Add(current))
        {
            if (current == updatingId)
                throw new DomainException("Khong the tao chu trinh trong cay thuoc tinh.");
            var parent = await _repository.GetAttributeAsync(current);
            if (parent?.IdThuocTinhCha is not int next)
                break;
            current = next;
        }
    }

    private static void Apply(SanPham product, TaoSanPhamRequest request)
    {
        product.IdDanhMuc = request.IdDanhMuc;
        product.IdHang = request.IdHang;
        product.IdDongSanPham = request.IdDongSanPham;
        product.IdDongCuThe = request.IdDongCuThe;
        product.TenSanPham = request.TenSanPham.Trim();
        product.GiaTien = request.GiaTien;
        product.MoTa = request.MoTa;
    }

    private static void Apply(Hang brand, TaoHangRequest request)
    {
        brand.TenHang = request.TenHang.Trim();
        brand.Logo = string.IsNullOrWhiteSpace(request.Logo) ? null : request.Logo.Trim();
        brand.TrangThai = request.TrangThai.Trim();
    }

    private static void Apply(ThuocTinhSanPham attribute, TaoThuocTinhRequest request)
    {
        attribute.IdDanhMuc = request.IdDanhMuc;
        attribute.IdThuocTinhCha = request.IdThuocTinhCha;
        attribute.TenThuocTinh = request.TenThuocTinh.Trim();
        attribute.KieuDuLieu = Enum.Parse<KieuDuLieuThuocTinh>(request.KieuDuLieu, false);
        attribute.DanhSachGiaTriLuaChon = request.DanhSachGiaTriLuaChon.ToList();
        attribute.BatBuoc = request.BatBuoc;
        attribute.ThuTu = request.ThuTu;
        attribute.TrangThai = request.TrangThai.Trim();
    }

    private static SanPhamAdminResponse ToResponse(SanPham x) => new(
        x.Id, x.IdDanhMuc, x.DanhMuc?.TenDanhMuc ?? string.Empty,
        x.IdHang, x.Hang?.TenHang, x.IdDongSanPham, x.IdDongCuThe,
        x.TenSanPham, x.GiaTien, x.MoTa);

    private static HangAdminResponse ToResponse(Hang x) =>
        new(x.Id, x.TenHang, x.Logo, x.TrangThai);

    private static ThuocTinhAdminResponse ToResponse(ThuocTinhSanPham x) =>
        new(x.Id, x.IdDanhMuc, x.IdThuocTinhCha, x.TenThuocTinh,
            x.KieuDuLieu.ToString(), x.DanhSachGiaTriLuaChon.ToList(),
            x.BatBuoc, x.ThuTu, x.TrangThai, x.NgayTao);

    private static (int Page, int PageSize) NormalizePaging(int page, int pageSize) =>
        (Math.Max(1, page), Math.Clamp(pageSize, 1, 100));
}
