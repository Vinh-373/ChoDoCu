
namespace ChoDoCu.Application.Features.Authorization.DTOs;

// Tao vai tro
public sealed record CreateRoleRequest(
    string MaVaiTro,
    string TenVaiTro,
    string? MoTa
);

// Cap nhat vai tro
public sealed record UpdateRoleRequest(
    string TenVaiTro,
    string? MoTa
);

// Cap nhat danh sach quyen cua vai tro
public sealed record UpdateRolePermissionsRequest(
    List<string> PermissionCodes
);

// Thong tin vai tro
public sealed record RoleDto(int Id, string TenVaiTro);

// Thong tin quyen
public sealed record PermissionDto(
    int Id,
    string MaChucNang,
    string TenChucNang,
    string? Nhom
);

// Danh sach quyen theo nhom
public sealed record PermissionGroupDto(
    string Nhom,
    IReadOnlyList<PermissionDto> Permissions
);

// Vai tro kem danh sach quyen
public sealed record RolePermissionDto(
    int RoleId,
    string MaVaiTro,
    string TenVaiTro,
    IReadOnlyList<PermissionDto> Permissions
);
