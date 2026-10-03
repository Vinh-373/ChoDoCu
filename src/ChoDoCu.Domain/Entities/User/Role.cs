using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class Role : BaseEntity   // Id <-> idRole
{
    public string TenRole { get; set; } = string.Empty;
    public string TrangThai { get; set; } = "HoatDong";

    public ICollection<RoleChucNang> RoleChucNangs { get; set; } = new List<RoleChucNang>();
}
