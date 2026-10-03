using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class ChucNang : BaseEntity   // Id <-> idChucNang
{
    public string TenChucNang { get; set; } = string.Empty;
    public string TrangThai { get; set; } = "HoatDong";

    public ICollection<RoleChucNang> RoleChucNangs { get; set; } = new List<RoleChucNang>();
}
