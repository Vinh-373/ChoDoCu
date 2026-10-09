
using ChoDoCu.Domain.Common;
namespace ChoDoCu.Domain.Entities;

public class DanhMuc : BaseEntity // Id  <->  cột idDanhMuc
{

    public int? IdDanhMucCha { get; set; }   // null = danh mục gốc
    public string TenDanhMuc { get; set; } = string.Empty;
    public string? AnhDanhMuc { get; set; }
    public string TrangThai { get; set; } = "HoatDong";
    public DateTime NgayTao { get; set; } = DateTime.Now;

    public DanhMuc? DanhMucCha { get; set; }
    public ICollection<DanhMuc> DanhMucCons { get; set; } = new List<DanhMuc>();
    public ICollection<SanPham> SanPhams { get; set; } = new List<SanPham>();
}
