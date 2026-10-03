namespace ChoDoCu.Application.Features.Banner.DTOs;

public record TaoBannerRequest(string HinhAnh, string? ViTri);
public record BannerResponse(int Id, string? HinhAnh, string? ViTri, DateTime? NgaySua);
