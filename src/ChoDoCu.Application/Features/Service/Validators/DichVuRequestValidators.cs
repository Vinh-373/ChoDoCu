using ChoDoCu.Application.Features.Service.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Service.Validators;

public class TaoDichVuRequestValidator : AbstractValidator<TaoDichVuRequest>
{
    public TaoDichVuRequestValidator()
    {
        RuleFor(x => x.TenDichVu).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Gia).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ThoiGianDichVu).GreaterThan(0);
        RuleFor(x => x.LuotDay).GreaterThanOrEqualTo(0);
        RuleFor(x => x.LuotDang).GreaterThanOrEqualTo(0);
    }
}

public class CapNhatDichVuRequestValidator : AbstractValidator<CapNhatDichVuRequest>
{
    public CapNhatDichVuRequestValidator()
    {
        RuleFor(x => x.TenDichVu).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Gia).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ThoiGianDichVu).GreaterThan(0);
        RuleFor(x => x.LuotDay).GreaterThanOrEqualTo(0);
        RuleFor(x => x.LuotDang).GreaterThanOrEqualTo(0);
    }
}
