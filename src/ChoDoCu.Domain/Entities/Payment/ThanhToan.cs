using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class ThanhToan : BaseEntity  // Id <-> idThanhToan
{
    public int IdMuaDichVu { get; set; }
    public int IdPhuongThucTT { get; set; }
    // Mã tham chiếu đơn hàng gửi cho cổng thanh toán, dùng để tìm lại giao dịch nội bộ.
    public string? MaGiaoDichNgoai { get; set; }
    // Mã giao dịch do MoMo/VNPay trả về sau khi xử lý.
    public string? MaGiaoDichCongTT { get; set; }
    // Mã phản hồi/trạng thái nguyên gốc do cổng thanh toán cung cấp.
    public string? MaPhanHoiCongTT { get; set; }
    public decimal TongTien { get; set; }
    public TrangThaiThanhToan TrangThai { get; set; } = TrangThaiThanhToan.ChoXuLy;
    public DateTime NgayTao { get; set; } = DateTime.Now;
    // Có giá trị khi cổng xác nhận thanh toán thành công.
    public DateTime? NgayThanhToan { get; set; }

    public MuaDichVu MuaDichVu { get; set; } = null!;
    public PhuongThucThanhToan PhuongThucTT { get; set; } = null!;   // VNPay, Momo, ChuyenKhoan...
}
