
using ChoDoCu.Application.Features.Authorization.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Authorization.Validators;

public class CreateRoleValidator : AbstractValidator<CreateRoleRequest>
{
    public CreateRoleValidator()
    {
        RuleFor(x => x.MaVaiTro)
            .NotEmpty().WithMessage("Mã vai trò không được để trống.")
            .MaximumLength(50)
            .Matches("^[a-zA-Z0-9_]+$")
            .WithMessage("Mã vai trò chỉ được chứa chữ, số và dấu gạch dưới.");

        RuleFor(x => x.TenVaiTro)
            .NotEmpty().WithMessage("Tên vai trò không được để trống.")
            .MaximumLength(100);

        RuleFor(x => x.MoTa)
            .MaximumLength(500);
    }
}
