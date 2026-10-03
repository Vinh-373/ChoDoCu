namespace ChoDoCu.Application.Features.Favorite.DTOs;

public record YeuThichResponse(
    int Id, int IdBaiDang, string TieuDe, decimal GiaTien, string? AnhDaiDien, DateTime NgayTao);
