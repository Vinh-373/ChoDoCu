using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using ChoDoCu.Domain.Constants;

namespace ChoDoCu.API.Authorization;

/// <summary>Dùng: [HasPermission(AppPermissions.BaiDangDuyet)] trên controller hoặc action.</summary>
public sealed class HasPermissionAttribute : AuthorizeAttribute
{
    public const string Prefix = "Permission:";
    public HasPermissionAttribute(string permission) => Policy = Prefix + permission;
}

public sealed class PermissionRequirement : IAuthorizationRequirement
{
    public PermissionRequirement(string permission) => Permission = permission;
    public string Permission { get; }
}

/// <summary>Tạo policy theo mã quyền khi cần, không phải khai báo từng policy trong Program.cs.</summary>
public sealed class PermissionPolicyProvider : DefaultAuthorizationPolicyProvider
{
    public PermissionPolicyProvider(IOptions<AuthorizationOptions> options) : base(options) { }

    public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.StartsWith(HasPermissionAttribute.Prefix, StringComparison.Ordinal))
        {
            return new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .AddRequirements(new PermissionRequirement(policyName[HasPermissionAttribute.Prefix.Length..]))
                .Build();
        }
        return await base.GetPolicyAsync(policyName);
    }
}

/// <summary>Đạt yêu cầu nếu JWT có claim "permission" trùng mã quyền.</summary>
public sealed class PermissionHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        if (context.User.HasClaim(AppPermissions.ClaimType, requirement.Permission))
            context.Succeed(requirement);
        return Task.CompletedTask;
    }
}
