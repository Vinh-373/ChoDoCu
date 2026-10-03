using ChoDoCu.Application.Features.Chat.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Chat.Validators;

public class GuiTinNhanRequestValidator : AbstractValidator<GuiTinNhanRequest>
{
    public GuiTinNhanRequestValidator()
    {
        RuleFor(x => x.IdNguoiNhan).GreaterThan(0);
        RuleFor(x => x.NoiDung).NotEmpty().MaximumLength(2000);
    }
}
