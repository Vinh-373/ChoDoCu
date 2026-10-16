using ChoDoCu.Application.Features.Payment.DTOs;

namespace ChoDoCu.Application.Features.Payment.Interfaces;

// Các thao tác thanh toán được controller gọi; xử lý nghiệp vụ và lưu DB nằm trong service.
public interface IThanhToanService
{
    Task<List<PhuongThucThanhToanResponse>> LayPhuongThucThanhToanAsync();

    /// <summary>Tạo đơn mua dịch vụ + phiếu thanh toán ở trạng thái ChờXửLý.</summary>
    Task<MuaDichVuResponse> MuaDichVuAsync(int idNguoiDung, MuaDichVuRequest request, string ipAddress);

    Task<List<LichSuMuaDichVuResponse>> LichSuMuaDichVuAsync(int idNguoiDung);

    Task<ThanhToanTrangThaiResponse> TrangThaiAsync(int idNguoiDung, int idThanhToan);

    Task XuLyCallbackAsync(string tenNhaCungCap, IReadOnlyDictionary<string, string> thamSo);
}
