using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class SanPham : BaseEntity   // Id  <->  cột idSanPham
{
    public int IdDanhMuc { get; set; }
    public int IdHang { get; set; }
    public int IdDongSanPham { get; set; }
    public int IdDongCuThe { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public decimal GiaTien { get; set; }
    public string MoTa { get; set; } = string.Empty;

    public DanhMuc DanhMuc { get; set; } = null!;
    public Hang Hang { get; set; } = null!;
    public DongSanPham DongSanPham { get; set; } = null!;
    public DongCuThe DongCuThe { get; set; } = null!;

    /// <summary>Quan hệ 1-1: mỗi sản phẩm thuộc đúng một bài đăng.</summary>
    public BaiDang? BaiDang { get; set; }
}
