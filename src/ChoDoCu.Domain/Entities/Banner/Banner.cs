
using ChoDoCu.Domain.Common;
namespace ChoDoCu.Domain.Entities;

public class Banner : BaseEntity // Id <-> idBanner
{

    public string? HinhAnh { get; set; }
    public string? ViTri { get; set; }
    public string TrangThai { get; set; } = "HoatDong";
    public DateTime? NgaySua { get; set; } = DateTime.Now;
}
