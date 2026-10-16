using ChoDoCu.Application.Features.Payment.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Payment.Validators;

public class MuaDichVuRequestValidator : AbstractValidator<MuaDichVuRequest>
{
    public MuaDichVuRequestValidator()
    {
        // Bat buoc ma dich vu hop le truoc khi tao giao dich.
        RuleFor(x => x.IdDichVu).GreaterThan(0);
        // Bat buoc ma phuong thuc thanh toan hop le.
RuleFor(x => x.IdPhuongThucTT).GreaterThan(0);    }
}
