using ChoDoCu.Application.Features.Auth.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Auth.Validators;

public class DangKyRequestValidator : AbstractValidator<DangKyRequest>
{
    private static readonly string[] GioiTinhHopLe = { "Nam", "Nữ", "Khác" };

    public DangKyRequestValidator()
    {
        RuleFor(x => x.HoTen).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(x => x.SoDienThoai)
            .NotEmpty()
            .Matches(@"^(0|\+84)\d{9}$").WithMessage("Số điện thoại không hợp lệ.");

        // Phải khớp cấu hình Password của Identity trong Infrastructure/DependencyInjection.cs
        RuleFor(x => x.MatKhau)
            .NotEmpty()
            .MinimumLength(6).WithMessage("Mật khẩu tối thiểu 6 ký tự.")
            .Matches("[a-z]").WithMessage("Mật khẩu phải có ít nhất 1 chữ thường.")
            .Matches("[A-Z]").WithMessage("Mật khẩu phải có ít nhất 1 chữ hoa.")
            .Matches("[0-9]").WithMessage("Mật khẩu phải có ít nhất 1 chữ số.");

        RuleFor(x => x.NgaySinh).LessThan(DateTime.Today).WithMessage("Ngày sinh phải ở quá khứ.");
        RuleFor(x => x.GioiTinh).Must(g => GioiTinhHopLe.Contains(g)).WithMessage("Giới tính phải là Nam, Nữ hoặc Khác.");
    }
}
