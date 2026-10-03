using ChoDoCu.Application.Features.Banner.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Banner.Validators;

public class TaoBannerRequestValidator : AbstractValidator<TaoBannerRequest>
{
    public TaoBannerRequestValidator()
    {
        RuleFor(x => x.HinhAnh).NotEmpty().MaximumLength(500);
    }
}
