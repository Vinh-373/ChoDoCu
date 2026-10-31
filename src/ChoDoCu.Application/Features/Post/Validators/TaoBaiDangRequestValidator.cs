using ChoDoCu.Application.Features.Post.DTOs;
using FluentValidation;

namespace ChoDoCu.Application.Features.Post.Validators;

public class TaoBaiDangRequestValidator : AbstractValidator<TaoBaiDangRequest>
{
    public const int SoAnhToiDa = 20;

    public TaoBaiDangRequestValidator()
    {
        RuleFor(x => x.IdDanhMuc).GreaterThan(0);
        RuleFor(x => x.MoTa).NotEmpty().MaximumLength(1500);
        RuleFor(x => x.Gia).GreaterThanOrEqualTo(0);
        RuleFor(x => x.IdThanhPho).GreaterThan(0);
        RuleFor(x => x.DiaChiChiTiet).MaximumLength(255);
        RuleFor(x => x.SoDienThoaiLienHe).MaximumLength(20);
        RuleFor(x => x.TieuDe).MaximumLength(70);
        RuleFor(x => x.ThuocTinhs)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(thuocTinhs => thuocTinhs is not null
                && thuocTinhs.All(x => x is not null)
                && thuocTinhs.Select(x => x.IdThuocTinh).Distinct().Count() == thuocTinhs.Count)
            .WithMessage("Mỗi thuộc tính chỉ được gửi một lần.")
            .ForEach(thuocTinh => thuocTinh.ChildRules(child =>
            {
                child.RuleFor(x => x.IdThuocTinh).GreaterThan(0);
                child.RuleFor(x => x.GiaTri).NotEmpty().MaximumLength(255);
            }));
        RuleFor(x => x.DanhSachHinhAnh)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(hinhAnhs => hinhAnhs is not null
                && hinhAnhs.All(x => x is not null)
                && hinhAnhs.All(x => !x.LaVideo || !x.LaAnhBia)
                && hinhAnhs.Count(x => !x.LaVideo) is >= 1 and <= SoAnhToiDa
                && hinhAnhs.Count(x => x.LaVideo) <= 1
                && hinhAnhs.Count(x => x.LaAnhBia && !x.LaVideo) == 1
                && hinhAnhs.All(x => !string.IsNullOrWhiteSpace(x.DuongDan)))
            .WithMessage($"Mỗi bài đăng cần từ 1 đến {SoAnhToiDa} ảnh, tối đa 1 video và đúng 1 ảnh bìa.");
    }
}
