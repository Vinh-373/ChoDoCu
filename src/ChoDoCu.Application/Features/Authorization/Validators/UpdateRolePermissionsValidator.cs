
using ChoDoCu.Application.Features.Authorization.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Authorization.Validators;

public class UpdateRolePermissionsValidator
    : AbstractValidator<UpdateRolePermissionsRequest>
{
    public UpdateRolePermissionsValidator()
    {
        RuleFor(x => x.PermissionCodes)
            .NotNull()
            .WithMessage("Danh sách quyền không được null.");

        RuleForEach(x => x.PermissionCodes)
            .NotEmpty()
            .WithMessage("Mã quyền không được để trống.")
            .MaximumLength(100);

        RuleFor(x => x.PermissionCodes)
            .Must(codes => codes == null ||
                codes.Distinct(StringComparer.OrdinalIgnoreCase).Count() == codes.Count)
            .WithMessage("Danh sách không được chứa mã quyền trùng lặp.");
    }
}
