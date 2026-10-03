using ChoDoCu.Domain.Common;
using ChoDoCu.Domain.Enums;

namespace ChoDoCu.Domain.Entities;

public class ThanhToan : BaseEntity   // Id <-> idThanhToan
{
    public int IdMuaDichVu { get; set; }
    public int IdPhuongThucTT { get; set; }
    public decimal TongTien { get; set; }
    public TrangThaiThanhToan TrangThai { get; set; } = TrangThaiThanhToan.ChoXuLy;
    public DateTime NgayTao { get; set; } = DateTime.Now;

    public MuaDichVu MuaDichVu { get; set; } = null!;
    public PhuongThucThanhToan PhuongThucTT { get; set; } = null!;   // VNPay, Momo, ChuyenKhoan...
}
