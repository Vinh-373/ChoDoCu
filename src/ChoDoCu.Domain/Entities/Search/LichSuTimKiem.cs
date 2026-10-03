using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class LichSuTimKiem : BaseEntity   // Id <-> idLichSu
{
    public int IdNguoiDung { get; set; }
    public string TuKhoa { get; set; } = string.Empty;
    public DateTime NgayTao { get; set; } = DateTime.Now;

    public NguoiDung NguoiDung { get; set; } = null!;
}
