using ChoDoCu.Application.Features.Auth.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Auth.Validators;

public class DangNhapRequestValidator : AbstractValidator<DangNhapRequest>
{
    public DangNhapRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.MatKhau).NotEmpty();
    }
}
