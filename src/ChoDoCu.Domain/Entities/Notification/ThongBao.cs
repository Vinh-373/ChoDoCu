
using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class ThongBao : BaseEntity  // Id <-> idThongBao
{
    public int IdNguoiDung { get; set; }
    public string TieuDe { get; set; } = string.Empty;
    public string? NoiDung { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public string TrangThai { get; set; } = "ChuaDoc";

    public NguoiDung NguoiDung { get; set; } = null!;

    public void DanhDauDaDoc() => TrangThai = "DaDoc";
}
