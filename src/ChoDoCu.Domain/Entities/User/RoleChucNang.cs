
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class RoleChucNang : BaseEntity // Id  <->  cột idRoleChucNang
{
    public int IdRole { get; set; }
    public int IdChucNang { get; set; }

    public Role Role { get; set; } = null!;
    public ChucNang ChucNang { get; set; } = null!;
}
