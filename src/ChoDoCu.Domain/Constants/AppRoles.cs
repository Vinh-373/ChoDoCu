namespace ChoDoCu.Domain.Constants;

/// <summary>Tên các Role mặc định (khớp cột name trong AspNetRoles).</summary>
public static class AppRoles
{
    public const string Admin = "Admin";
    public const string Moderator = "Moderator";
    public const string User = "User";

    public static readonly string[] All = { Admin, Moderator, User };
}
