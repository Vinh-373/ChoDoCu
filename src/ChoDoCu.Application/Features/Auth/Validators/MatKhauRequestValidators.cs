using ChoDoCu.Application.Common.Validation;
using ChoDoCu.Application.Features.Auth.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Auth.Validators;

public class DoiMatKhauRequestValidator : AbstractValidator<DoiMatKhauRequest>
{
    public DoiMatKhauRequestValidator()
    {
        RuleFor(x => x.MatKhauCu).NotEmpty().WithMessage("Vui lòng nhập mật khẩu hiện tại.");
        RuleFor(x => x.MatKhauMoi).MatKhauHopLe();
        RuleFor(x => x.MatKhauMoi)
            .NotEqual(x => x.MatKhauCu).WithMessage("Mật khẩu mới phải khác mật khẩu hiện tại.");
    }
}

public class QuenMatKhauRequestValidator : AbstractValidator<QuenMatKhauRequest>
{
    public QuenMatKhauRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class DatLaiMatKhauRequestValidator : AbstractValidator<DatLaiMatKhauRequest>
{
    public DatLaiMatKhauRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.MaOTP).NotEmpty();
        RuleFor(x => x.MatKhauMoi).MatKhauHopLe();
    }
}
