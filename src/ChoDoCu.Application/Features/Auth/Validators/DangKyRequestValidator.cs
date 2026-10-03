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
        RuleFor(x => x.MatKhau).NotEmpty().MinimumLength(6).WithMessage("Mật khẩu tối thiểu 6 ký tự.");
        RuleFor(x => x.NgaySinh).LessThan(DateTime.Today).WithMessage("Ngày sinh phải ở quá khứ.");
        RuleFor(x => x.GioiTinh).Must(g => GioiTinhHopLe.Contains(g)).WithMessage("Giới tính phải là Nam, Nữ hoặc Khác.");
    }
}
