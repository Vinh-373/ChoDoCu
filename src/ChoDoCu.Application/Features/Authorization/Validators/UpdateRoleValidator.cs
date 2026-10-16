
using ChoDoCu.Application.Features.Authorization.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Authorization.Validators;

public class UpdateRoleValidator : AbstractValidator<UpdateRoleRequest>
{
    public UpdateRoleValidator()
    {
        RuleFor(x => x.TenVaiTro)
            .NotEmpty().WithMessage("Tên vai trò không được để trống.")
            .MaximumLength(100);

        RuleFor(x => x.MoTa)
            .MaximumLength(500);
    }
}
