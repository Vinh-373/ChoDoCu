using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class YeuThich : BaseEntity   // Id <-> idYeuThich
{
    public int IdNguoiDung { get; set; }
    public int IdBaiDang { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.Now;

    public NguoiDung NguoiDung { get; set; } = null!;
    public BaiDang BaiDang { get; set; } = null!;
}
