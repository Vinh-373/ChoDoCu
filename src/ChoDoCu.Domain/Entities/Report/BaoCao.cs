using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class BaoCao : BaseEntity   // Id <-> idBaoCao
{
    public int IdNguoiDung { get; set; }   // người báo cáo
    public int IdBaiDang { get; set; }
    public string? NoiDung { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public string TrangThai { get; set; } = "ChoXuLy";

    public NguoiDung NguoiDung { get; set; } = null!;
    public BaiDang BaiDang { get; set; } = null!;
}
