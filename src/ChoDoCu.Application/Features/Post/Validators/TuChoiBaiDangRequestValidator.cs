using ChoDoCu.Application.Features.Post.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Post.Validators;

public class TuChoiBaiDangRequestValidator : AbstractValidator<TuChoiBaiDangRequest>
{
    public TuChoiBaiDangRequestValidator()
    {
        RuleFor(x => x.LyDo)
            .Must(lyDo => !string.IsNullOrWhiteSpace(lyDo))
            .WithMessage("Vui lòng nhập lý do từ chối.")
            .MaximumLength(1000)
            .WithMessage("Lý do từ chối không được vượt quá 1000 ký tự.");
    }
}
