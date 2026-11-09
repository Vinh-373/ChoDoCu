using ChoDoCu.Application.Features.Post.DTOs;
using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Application.Common.Mappings;

/// <summary>Map Entity -> DTO thủ công (đủ dùng cho đồ án, không cần AutoMapper). Cần Include đủ navigation.</summary>
public static class BaiDangMapping
{
    public static BaiDangResponse ToResponse(this BaiDang b, bool laTinUuTien = false)
    {
        var anhBia = b.HinhAnhBaiDangs
            .Where(h => !h.LaVideo && h.LaAnhBia)
            .OrderBy(h => h.ThuTu)
            .Select(h => h.DuongDan)
            .FirstOrDefault()
            ?? b.HinhAnhBaiDangs
                .Where(h => !h.LaVideo)
                .OrderBy(h => h.ThuTu)
                .Select(h => h.DuongDan)
                .FirstOrDefault()
            ?? b.AnhSanPhams.Select(a => a.Url).FirstOrDefault();

        return new BaiDangResponse(
            b.Id,
            b.MaTin,
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
            b.HinhAnhBaiDangs.OrderBy(h => h.ThuTu).Select(h => h.DuongDan)
                .Concat(b.AnhSanPhams.Select(a => a.Url))
                .ToList(),
            AnhBia: anhBia,
            NgayDayTin: b.NgayDayTin,
            LaTinUuTien: laTinUuTien);
    }
}
