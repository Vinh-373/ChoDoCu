using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class Hang : BaseEntity   // Id <-> idHang
{
    public string? TenHang { get; set; }
    public string? Logo { get; set; }
    public string TrangThai { get; set; } = "HoatDong";

    public ICollection<DongSanPham> DongSanPhams { get; set; } = new List<DongSanPham>();
    public ICollection<SanPham> SanPhams { get; set; } = new List<SanPham>();
}
