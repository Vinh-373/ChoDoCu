using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class DongSanPham : BaseEntity   // Id <-> idDongSanPham
{
    public string? TenDongSanPham { get; set; }
    public string TrangThai { get; set; } = "HoatDong";
    public int IdHang { get; set; }
    public int IdDanhMuc { get; set; }

    public Hang Hang { get; set; } = null!;
    public DanhMuc DanhMuc { get; set; } = null!;
    public ICollection<DongCuThe> DongCuThes { get; set; } = new List<DongCuThe>();
    public ICollection<SanPham> SanPhams { get; set; } = new List<SanPham>();
}
