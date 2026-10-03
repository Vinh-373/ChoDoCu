using ChoDoCu.Application.Features.Post.DTOs;
using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Application.Common.Mappings;

/// <summary>Map Entity -> DTO thủ công (đủ dùng cho đồ án, không cần AutoMapper). Cần Include đủ navigation.</summary>
public static class BaiDangMapping
{
    public static BaiDangResponse ToResponse(this BaiDang b) => new(
        b.Id,
        b.TieuDe,
        b.NoiDung,
        b.SanPham.TenSanPham,
        b.SanPham.GiaTien,
        b.DiaChi,
        b.DiaChiChiTiet,
        b.NgayDang,
        b.TrangThai.ToString(),
        b.IdNguoiDung,
        b.NguoiDung.HoTen,
        b.DanhMuc.TenDanhMuc,
        b.ThanhPho.TenThanhPho,
        b.AnhSanPhams.Select(a => a.Url).ToList());
}
