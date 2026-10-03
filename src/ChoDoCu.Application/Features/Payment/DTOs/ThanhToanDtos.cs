namespace ChoDoCu.Application.Features.Payment.DTOs;

public record MuaDichVuRequest(int IdDichVu, int IdPhuongThucTT);
public record MuaDichVuResponse(
    int IdMuaDichVu, int IdThanhToan, string TenDichVu, decimal TongTien, string TrangThai, DateTime NgayTao);

public record XacNhanThanhToanRequest(int IdThanhToan, bool ThanhCong);
