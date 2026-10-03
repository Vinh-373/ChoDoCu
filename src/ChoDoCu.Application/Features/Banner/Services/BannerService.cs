using ChoDoCu.Application.Features.Banner.DTOs;
using ChoDoCu.Application.Features.Banner.Interfaces;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;

namespace ChoDoCu.Application.Features.Banner.Services;

public class BannerService : IBannerService
{
    private readonly IUnitOfWork _uow;
    private readonly IValidator<TaoBannerRequest> _validator;

    public BannerService(IUnitOfWork uow, IValidator<TaoBannerRequest> validator)
    {
        _uow = uow;
        _validator = validator;
    }

    public async Task<List<BannerResponse>> DanhSachAsync(string? viTri)
    {
        var list = await _uow.Banners.DanhSachTheoViTriAsync(viTri);
        return list.Select(ToResponse).ToList();
    }

    public async Task<BannerResponse> TaoAsync(TaoBannerRequest request)
    {
        await _validator.ValidateAndThrowAsync(request);

        var banner = new Domain.Entities.Banner { HinhAnh = request.HinhAnh, ViTri = request.ViTri, NgaySua = DateTime.Now };
        await _uow.Banners.AddAsync(banner);
        await _uow.SaveChangesAsync();

        return ToResponse(banner);
    }

    public async Task XoaAsync(int id)
    {
        var banner = await _uow.Banners.GetByIdAsync(id) ?? throw new NotFoundException(nameof(Domain.Entities.Banner), id);
        _uow.Banners.Remove(banner);
        await _uow.SaveChangesAsync();
    }

    private static BannerResponse ToResponse(Domain.Entities.Banner b) => new(b.Id, b.HinhAnh, b.ViTri, b.NgaySua);
}
