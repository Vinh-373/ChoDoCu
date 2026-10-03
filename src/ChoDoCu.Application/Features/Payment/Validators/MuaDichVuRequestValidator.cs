using ChoDoCu.Application.Features.Payment.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Payment.Validators;

public class MuaDichVuRequestValidator : AbstractValidator<MuaDichVuRequest>
{
    public MuaDichVuRequestValidator()
    {
        RuleFor(x => x.IdDichVu).GreaterThan(0);
RuleFor(x => x.IdPhuongThucTT).GreaterThan(0);    }
}
