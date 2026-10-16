namespace ChoDoCu.Application.Features.Payment.DTOs;

// Phương thức thanh toán được phép hiển thị và lựa chọn khi tạo giao dịch.
public record PhuongThucThanhToanResponse(
    int Id,
    string TenPhuongThuc,
    string? MoTa);

// Thông tin gói dịch vụ và phương thức người dùng chọn để bắt đầu thanh toán.
public record MuaDichVuRequest(int IdDichVu, int IdPhuongThucTT);
// Kết quả khởi tạo đơn, bao gồm URL chuyển người dùng sang trang thanh toán.
public record MuaDichVuResponse(
    int IdMuaDichVu,
    int IdThanhToan,
    string MaGiaoDichNgoai,
    string TenDichVu,
    decimal TongTien,
    string TrangThai,
    string UrlThanhToan,
    DateTime NgayTao);

// Một lần mua dịch vụ cùng các giao dịch thanh toán liên quan, dùng cho màn hình lịch sử.
public record LichSuMuaDichVuResponse(
    int IdMuaDichVu,
    int IdDichVu,
    string TenDichVu,
    decimal Gia,
    int ThoiGianDichVu,
    DateTime NgayMua,
    DateTime? NgayHetHan,
    string TrangThai,
    IReadOnlyList<ThanhToanLichSuResponse> ThanhToans);

// Thông tin thanh toán được hiển thị bên trong lịch sử mua dịch vụ.
public record ThanhToanLichSuResponse(
    int IdThanhToan,
    decimal TongTien,
    string TrangThai,
    string? MaGiaoDichCongTT,
    DateTime NgayTao,
    DateTime? NgayThanhToan);

// Trạng thái hiện tại của một giao dịch thuộc người dùng đang đăng nhập.
public record ThanhToanTrangThaiResponse(
    int IdThanhToan, string TrangThai, decimal TongTien, DateTime NgayTao, DateTime? NgayThanhToan);
