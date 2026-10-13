using FluentValidation;

namespace ChoDoCu.Application.Common.Validation;

public static class MatKhauRules
{
    /// <summary>Quy tắc mật khẩu dùng chung. Phải khớp cấu hình Password của Identity (Infrastructure/DependencyInjection.cs).</summary>
    public static IRuleBuilderOptions<T, string> MatKhauHopLe<T>(this IRuleBuilder<T, string> rule) =>
        rule.NotEmpty().WithMessage("Mật khẩu không được để trống.")
            .MinimumLength(6).WithMessage("Mật khẩu tối thiểu 6 ký tự.")
            .Matches("[a-z]").WithMessage("Mật khẩu phải có ít nhất 1 chữ thường.")
            .Matches("[A-Z]").WithMessage("Mật khẩu phải có ít nhất 1 chữ hoa.")
            .Matches("[0-9]").WithMessage("Mật khẩu phải có ít nhất 1 chữ số.");
}
