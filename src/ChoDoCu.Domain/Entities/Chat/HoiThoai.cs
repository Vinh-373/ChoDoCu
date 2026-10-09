
using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class HoiThoai : BaseEntity // Id <-> idHoiThoai
{
    public int IdNguoiDung1 { get; set; }
    public int IdNguoiDung2 { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public DateTime? TinNhanCuoi { get; set; }

    public NguoiDung NguoiDung1 { get; set; } = null!;
    public NguoiDung NguoiDung2 { get; set; } = null!;
    public ICollection<TinNhan> TinNhans { get; set; } = new List<TinNhan>();

    public static (int Nho, int Lon) SapXep(int idA, int idB) => idA < idB ? (idA, idB) : (idB, idA);
}
