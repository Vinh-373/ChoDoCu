
using ChoDoCu.Domain.Common;
namespace ChoDoCu.Domain.Entities;

public class TinNhan : BaseEntity  // Id <-> idTinNhan
{
    public int IdHoiThoai { get; set; }
    public int IdNguoiGui { get; set; }
    public string NoiDung { get; set; } = string.Empty;
    public bool DaXem { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.Now;

    public HoiThoai HoiThoai { get; set; } = null!;
    public NguoiDung NguoiGui { get; set; } = null!;
}
