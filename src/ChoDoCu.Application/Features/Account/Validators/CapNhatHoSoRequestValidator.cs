using ChoDoCu.Application.Features.Account.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Account.Validators;

public class CapNhatHoSoRequestValidator : AbstractValidator<CapNhatHoSoRequest>
{
    private static readonly string[] GioiTinhHopLe = { "Nam", "Nữ", "Khác" };

    public CapNhatHoSoRequestValidator()
    {
        RuleFor(x => x.HoTen).NotEmpty().MaximumLength(255);
        RuleFor(x => x.SoDienThoai)
            .NotEmpty()
            .Matches(@"^(0|\+84)\d{9}$").WithMessage("Số điện thoại không hợp lệ.");
        RuleFor(x => x.NgaySinh).LessThan(DateTime.Today).WithMessage("Ngày sinh phải ở quá khứ.");
        RuleFor(x => x.GioiTinh).Must(g => GioiTinhHopLe.Contains(g)).WithMessage("Giới tính phải là Nam, Nữ hoặc Khác.");
        RuleFor(x => x.AnhNguoiDung).MaximumLength(255);
        RuleFor(x => x.IdThanhPho).GreaterThan(0).When(x => x.IdThanhPho.HasValue);
        RuleFor(x => x.IdPhuongXa).GreaterThan(0).When(x => x.IdPhuongXa.HasValue);
    }
}
