namespace ChoDoCu.Domain.Entities;

/// <summary>Bảng nối N-N: khóa chính ghép (IdSanPham, IdThuocTinh), không kế thừa BaseEntity vì không có cột Id riêng.</summary>
public class SanPhamThuocTinh
{
    public int IdSanPham { get; set; }
    public int IdThuocTinh { get; set; }
    public string? GiaTri { get; set; }

    public SanPham SanPham { get; set; } = null!;
    public ThuocTinhSanPham ThuocTinh { get; set; } = null!;
}
