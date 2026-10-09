using Microsoft.AspNetCore.Identity;

namespace ChoDoCu.Domain.Entities;

/// <summary>
/// Vai trò hệ thống. Kế thừa IdentityRole&lt;int&gt; để tích hợp ASP.NET Core Identity.
/// Identity cung cấp sẵn: Id, Name, NormalizedName, ConcurrencyStamp.
/// Sử dụng property Name (từ Identity) thay cho TenRole cũ.
/// </summary>
public class Role : IdentityRole<int>
{
    public string MoTa { get; set; } = string.Empty;
    public string TenChucVu { get; set; } = string.Empty;
    public string TrangThai { get; set; } = "HoatDong";

    public ICollection<RoleChucNang> RoleChucNangs { get; set; } = new List<RoleChucNang>();
}
