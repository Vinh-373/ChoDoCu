using ChoDoCu.Application.Features.Post.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Post.Validators;

public class TaoBaiDangRequestValidator : AbstractValidator<TaoBaiDangRequest>
{
    public TaoBaiDangRequestValidator()
    {
        RuleFor(x => x.TieuDe).NotEmpty().MaximumLength(255);
        RuleFor(x => x.NoiDung).NotEmpty();
        RuleFor(x => x.TenSanPham).NotEmpty().MaximumLength(255);
        RuleFor(x => x.GiaTien).GreaterThanOrEqualTo(0);
        RuleFor(x => x.IdDanhMuc).GreaterThan(0);
        RuleFor(x => x.IdThanhPho).GreaterThan(0);
        RuleFor(x => x.DiaChi).NotEmpty().MaximumLength(255);
        RuleFor(x => x.DiaChiChiTiet).NotEmpty().MaximumLength(255);
        RuleFor(x => x.UrlAnhs).NotNull().Must(a => a.Count is >= 1 and <= 10)
            .WithMessage("Mỗi bài đăng cần từ 1 đến 10 ảnh.");
    }
}
