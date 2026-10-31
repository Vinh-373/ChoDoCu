using ChoDoCu.Application.Features.Admin.DTOs;
using ChoDoCu.Domain.Enums;
using FluentValidation;

namespace ChoDoCu.Application.Features.Admin.Validators;

public class TaoSanPhamRequestValidator : AbstractValidator<TaoSanPhamRequest>
{
    public TaoSanPhamRequestValidator()
    {
        RuleFor(x => x.IdDanhMuc).GreaterThan(0);
        RuleFor(x => x.IdHang).GreaterThan(0).When(x => x.IdHang.HasValue);
        RuleFor(x => x.IdDongSanPham).GreaterThan(0).When(x => x.IdDongSanPham.HasValue);
        RuleFor(x => x.IdDongCuThe).GreaterThan(0).When(x => x.IdDongCuThe.HasValue);
        RuleFor(x => x.TenSanPham).NotEmpty().MaximumLength(255);
        RuleFor(x => x.GiaTien).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MoTa).NotNull();
    }
}

public class TaoHangRequestValidator : AbstractValidator<TaoHangRequest>
{
    public TaoHangRequestValidator()
    {
        RuleFor(x => x.TenHang).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Logo).MaximumLength(500);
        RuleFor(x => x.TrangThai).NotEmpty().MaximumLength(50);
    }
}

public class TaoThuocTinhRequestValidator : AbstractValidator<TaoThuocTinhRequest>
{
    public TaoThuocTinhRequestValidator()
    {
        RuleFor(x => x.IdDanhMuc).GreaterThan(0).When(x => x.IdDanhMuc.HasValue);
        RuleFor(x => x.IdThuocTinhCha).GreaterThan(0).When(x => x.IdThuocTinhCha.HasValue);
        RuleFor(x => x.TenThuocTinh).NotEmpty().MaximumLength(255);
        RuleFor(x => x.KieuDuLieu)
            .Must(value => Enum.TryParse<KieuDuLieuThuocTinh>(value, false, out var type)
                && Enum.IsDefined(type));
        RuleFor(x => x.DanhSachGiaTriLuaChon).NotNull();
        RuleForEach(x => x.DanhSachGiaTriLuaChon).NotEmpty().MaximumLength(255);
        RuleFor(x => x.ThuTu).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TrangThai).NotEmpty().MaximumLength(50);
    }
}
