using ChoDoCu.Application.Features.Payment.DTOs;

namespace ChoDoCu.Application.Features.Payment.Interfaces;

public interface IThanhToanService
{
    /// <summary>Tạo đơn mua dịch vụ + phiếu thanh toán ở trạng thái ChờXửLý.</summary>
    Task<MuaDichVuResponse> MuaDichVuAsync(int idNguoiDung, MuaDichVuRequest request);

    /// <summary>
    /// Xác nhận kết quả thanh toán. Trong đồ án thật, hàm này được gọi bởi webhook của cổng thanh toán
    /// (VNPay/Momo), không phải do người dùng gọi trực tiếp.
    /// </summary>
    Task XacNhanAsync(XacNhanThanhToanRequest request);
}
