using ChoDoCu.Domain.Common;
using ChoDoCu.Domain.Enums;

namespace ChoDoCu.Domain.Entities;

public class NguoiDung : BaseEntity   // Id  <->  cột idNguoiDung
{
    public string? AnhNguoiDung { get; set; }
    public string? UserName { get; set; }

    /// <summary>Mã băm BCrypt của mật khẩu (cột passWord). Tuyệt đối không lưu mật khẩu thô.</summary>
    public string? PasswordHash { get; set; }

    public int? IdThanhPho { get; set; }
    public int? IdPhuongXa { get; set; }

    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime NgaySinh { get; set; }
    public string GioiTinh { get; set; } = string.Empty;

    public VaiTro Role { get; set; } = VaiTro.User;
    public int LuotDang { get; set; }
    public int LuotDay { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public TrangThaiNguoiDung TrangThai { get; set; } = TrangThaiNguoiDung.HoatDong;

    // Navigation
    public ThanhPho? ThanhPho { get; set; }
    public PhuongXa? PhuongXa { get; set; }
    public ICollection<BaiDang> BaiDangs { get; set; } = new List<BaiDang>();
    public ICollection<YeuThich> YeuThichs { get; set; } = new List<YeuThich>();
    public ICollection<ThongBao> ThongBaos { get; set; } = new List<ThongBao>();
    public ICollection<MuaDichVu> MuaDichVus { get; set; } = new List<MuaDichVu>();
}
