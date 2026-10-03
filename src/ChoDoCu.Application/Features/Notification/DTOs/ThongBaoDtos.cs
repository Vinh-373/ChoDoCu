namespace ChoDoCu.Application.Features.Notification.DTOs;

public record ThongBaoResponse(int Id, string TieuDe, string? NoiDung, DateTime NgayTao, string TrangThai);
public record DemChuaDocResponse(int SoLuong);
