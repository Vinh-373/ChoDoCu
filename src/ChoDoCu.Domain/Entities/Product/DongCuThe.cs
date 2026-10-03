using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class DongCuThe : BaseEntity   // Id <-> idDongCuThe
{
    public string? TenDongCuThe { get; set; }
    public string TrangThai { get; set; } = "HoatDong";
    public int IdDongSanPham { get; set; }

    public DongSanPham DongSanPham { get; set; } = null!;
    public ICollection<SanPham> SanPhams { get; set; } = new List<SanPham>();
}
