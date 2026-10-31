using ChoDoCu.Application.Features.Account.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Account.Validators;

public class CapNhatHoSoRequestValidator : AbstractValidator<CapNhatHoSoRequest>
{
    // "Chưa XĐ" là giá trị mặc định khi người dùng chưa chọn giới tính (tài khoản Google, hoặc để trống ở trang hồ sơ).
    private static readonly string[] GioiTinhHopLe = { "Nam", "Nữ", "Khác", "Chưa XĐ" };

    public CapNhatHoSoRequestValidator()
    {
        RuleFor(x => x.HoTen).NotEmpty().MaximumLength(255);

        // Số điện thoại tùy chọn: để trống = giữ nguyên số hiện có; nếu nhập thì phải đúng định dạng.
        RuleFor(x => x.SoDienThoai)
            .Matches(@"^(0|\+84)\d{9}$").WithMessage("Số điện thoại không hợp lệ.")
            .When(x => !string.IsNullOrWhiteSpace(x.SoDienThoai));

        // Ngày sinh tùy chọn: null = giữ nguyên.
        RuleFor(x => x.NgaySinh)
            .Must(d => d!.Value.Date < DateTime.Today).WithMessage("Ngày sinh phải ở quá khứ.")
            .When(x => x.NgaySinh.HasValue);

        // Giới tính tùy chọn: để trống = giữ nguyên.
        RuleFor(x => x.GioiTinh)
            .Must(g => GioiTinhHopLe.Contains(g!.Trim()))
            .WithMessage("Giới tính phải là Nam, Nữ, Khác hoặc Chưa XĐ.")
            .When(x => !string.IsNullOrWhiteSpace(x.GioiTinh));

        RuleFor(x => x.AnhNguoiDung).MaximumLength(255);
        RuleFor(x => x.IdThanhPho).GreaterThan(0).When(x => x.IdThanhPho.HasValue);
        RuleFor(x => x.IdPhuongXa).GreaterThan(0).When(x => x.IdPhuongXa.HasValue);

        RuleFor(x => x.TenGianHang).MaximumLength(100);
        RuleFor(x => x.DiaChiChiTiet).MaximumLength(255);
        RuleFor(x => x.GioiThieu).MaximumLength(500);
    }
}