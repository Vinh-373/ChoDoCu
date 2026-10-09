
using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class PhuongThucThanhToan : BaseEntity  // Id <-> idPhuongThucTT
{
    public string TenPhuongThuc { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string TrangThai { get; set; } = "HoatDong";
    public DateTime NgayTao { get; set; } = DateTime.Now;

    public ICollection<ThanhToan> ThanhToans { get; set; } = new List<ThanhToan>();
}
