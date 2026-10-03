using ChoDoCu.Domain.Common;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Exceptions;

namespace ChoDoCu.Domain.Entities;

public class MuaDichVu : BaseEntity   // Id <-> idMuaDichVu
{
    public int IdDichVu { get; set; }
    public int IdNguoiDung { get; set; }
    public DateTime NgayMua { get; set; } = DateTime.Now;
    public DateTime? NgayHetHan { get; set; }
    public TrangThaiThanhToan TrangThai { get; set; } = TrangThaiThanhToan.ChoXuLy;

    public DichVu DichVu { get; set; } = null!;
    public NguoiDung NguoiDung { get; set; } = null!;
    public ICollection<ThanhToan> ThanhToans { get; set; } = new List<ThanhToan>();

    /// <summary>Gọi khi thanh toán thành công: kích hoạt gói dịch vụ.</summary>
    public void KichHoat()
    {
        if (TrangThai == TrangThaiThanhToan.ThanhCong)
            throw new DomainException("Gói dịch vụ này đã được kích hoạt trước đó.");

        TrangThai = TrangThaiThanhToan.ThanhCong;
        NgayHetHan = DateTime.Now.AddDays(DichVu.ThoiGianDichVu);
    }
}
