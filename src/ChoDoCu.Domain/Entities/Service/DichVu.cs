using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class DichVu : BaseEntity   // Id  <->  cột idDichVu
{
    public string TenDichVu { get; set; } = string.Empty;
    public decimal Gia { get; set; }
    public int ThoiGianDichVu { get; set; }   // số ngày hiệu lực
    public int LuotDay { get; set; }
    public int LuotDang { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public string TrangThai { get; set; } = "HoatDong";
}
