namespace ChoDoCu.Application.Features.Location.DTOs;

public record ThanhPhoResponse(int Id, string TenThanhPho);
public record PhuongXaResponse(int Id, int IdThanhPho, string TenPhuongXa);
