using ChoDoCu.Application.Features.Report.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Report.Validators;

public class TaoBaoCaoRequestValidator : AbstractValidator<TaoBaoCaoRequest>
{
    public TaoBaoCaoRequestValidator()
    {
        RuleFor(x => x.IdBaiDang).GreaterThan(0);
        RuleFor(x => x.NoiDung).NotEmpty().MaximumLength(1000);
    }
}
