using ChoDoCu.Application.Features.Banner.DTOs;

namespace ChoDoCu.Application.Features.Banner.Interfaces;

public interface IBannerService
{
    Task<List<BannerResponse>> DanhSachAsync(string? viTri);
    Task<BannerResponse> TaoAsync(TaoBannerRequest request);
    Task XoaAsync(int id);
}
