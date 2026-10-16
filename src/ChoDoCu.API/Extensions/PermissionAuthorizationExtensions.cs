using ChoDoCu.API.Authorization;
using Microsoft.AspNetCore.Authorization;

namespace ChoDoCu.API.Extensions;

public static class PermissionAuthorizationExtensions
{
    /// <summary>Đăng ký provider + handler để dùng [HasPermission("...")]. Gọi sau AddJwtAuth.</summary>
    public static IServiceCollection AddPermissionAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization();
        services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
        services.AddSingleton<IAuthorizationHandler, PermissionHandler>();
        return services;
    }
}
