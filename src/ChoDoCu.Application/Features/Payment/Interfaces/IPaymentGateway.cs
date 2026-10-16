namespace ChoDoCu.Application.Features.Payment.Interfaces;

// Dữ liệu nội bộ dùng chung để tạo liên kết thanh toán cho các cổng khác nhau.
public sealed record TaoLienKetThanhToanRequest(
    int IdThanhToan,
    string MaGiaoDich,
    decimal SoTien,
    string NoiDung,
    string DiaChiIp);

// Kết quả callback sau khi gateway xác thực chữ ký; service dùng dữ liệu này để cập nhật DB.
public sealed record KetQuaCallbackCongThanhToan(
    string MaGiaoDich,
    decimal SoTien,
    bool ThanhCong,
    string? MaGiaoDichCongTT,
    string MaPhanHoiCongTT,
    DateTime? NgayThanhToan);

// Hợp đồng giúp tầng Application không phụ thuộc trực tiếp vào SDK riêng của từng cổng thanh toán.
public interface IPaymentGateway
{
    // Tên phải khớp với phương thức thanh toán đã khai báo trong cơ sở dữ liệu.
    string TenPhuongThuc { get; }

    // Tạo URL để chuyển người dùng sang trang thanh toán của nhà cung cấp.
    Task<string> TaoUrlThanhToanAsync(TaoLienKetThanhToanRequest request, CancellationToken cancellationToken = default);

    // Kiểm tra chữ ký và chuẩn hóa dữ liệu callback trước khi service xử lý giao dịch.
    KetQuaCallbackCongThanhToan XacThucCallback(IReadOnlyDictionary<string, string> thamSo);
}
