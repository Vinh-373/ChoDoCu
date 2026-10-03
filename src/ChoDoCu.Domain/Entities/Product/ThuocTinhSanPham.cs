using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

/// <summary>Danh sách thuộc tính dùng chung: Thương hiệu, Màu sắc, RAM... Giá trị cụ thể nằm ở SanPhamThuocTinh.</summary>
public class ThuocTinhSanPham : BaseEntity   // Id <-> idThuocTinh
{
    public string TenThuocTinh { get; set; } = string.Empty;
    public string TrangThai { get; set; } = "HoatDong";
    public DateTime NgayTao { get; set; } = DateTime.Now;

    public ICollection<SanPhamThuocTinh> SanPhamThuocTinhs { get; set; } = new List<SanPhamThuocTinh>();
}
