using ChoDoCu.Application.Features.Category.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Category.Validators;

public class TaoDanhMucRequestValidator : AbstractValidator<TaoDanhMucRequest>
{
    public TaoDanhMucRequestValidator()
    {
        RuleFor(x => x.TenDanhMuc).NotEmpty().MaximumLength(255);
    }
}

public class CapNhatDanhMucRequestValidator : AbstractValidator<CapNhatDanhMucRequest>
{
    public CapNhatDanhMucRequestValidator()
    {
        RuleFor(x => x.TenDanhMuc).NotEmpty().MaximumLength(255);
        RuleFor(x => x.TrangThai).NotEmpty();
    }
}
