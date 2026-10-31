using ChoDoCu.Domain.Common;
using ChoDoCu.Domain.Enums;

namespace ChoDoCu.Domain.Entities;

/// <summary>Danh sách thuộc tính dùng chung: Thương hiệu, Màu sắc, RAM... Giá trị cụ thể nằm ở SanPhamThuocTinh.</summary>
public class ThuocTinhSanPham : BaseEntity   // Id <-> idThuocTinh
{
    public int? IdDanhMuc { get; set; }
    public int? IdThuocTinhCha { get; set; }
    public string TenThuocTinh { get; set; } = string.Empty;
    public KieuDuLieuThuocTinh KieuDuLieu { get; set; }
    public List<string> DanhSachGiaTriLuaChon { get; set; } = new();
    public bool BatBuoc { get; set; }
    public int ThuTu { get; set; }
    public string TrangThai { get; set; } = "HoatDong";
    public DateTime NgayTao { get; set; } = DateTime.Now;

    public DanhMuc? DanhMuc { get; set; }
    public ThuocTinhSanPham? ThuocTinhCha { get; set; }
    public ICollection<ThuocTinhSanPham> ThuocTinhCons { get; set; } = new List<ThuocTinhSanPham>();
    public ICollection<SanPhamThuocTinh> SanPhamThuocTinhs { get; set; } = new List<SanPhamThuocTinh>();
}
