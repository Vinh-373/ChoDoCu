using ChoDoCu.Domain.Common;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Exceptions;

namespace ChoDoCu.Domain.Entities;

public class BaiDang : BaseEntity   // Id  <->  cột idBaiDang
{
    public int IdNguoiDung { get; set; }
    public int IdSanPham { get; set; }
    public int IdDanhMuc { get; set; }
    public int IdThanhPho { get; set; }
    public int? IdPhuongXa { get; set; }
    public int? IdDichVu { get; set; }

    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public string DiaChiChiTiet { get; set; } = string.Empty;
    public DateTime NgayDang { get; set; } = DateTime.Now;
    public TrangThaiBaiDang TrangThai { get; set; } = TrangThaiBaiDang.ChoDuyet;
    public DateTime? UuTien { get; set; }

    // Navigation
    public NguoiDung NguoiDung { get; set; } = null!;
    public SanPham SanPham { get; set; } = null!;
    public DanhMuc DanhMuc { get; set; } = null!;
    public ThanhPho ThanhPho { get; set; } = null!;
    public PhuongXa? PhuongXa { get; set; }
    public DichVu? DichVu { get; set; }
    public ICollection<AnhSanPham> AnhSanPhams { get; set; } = new List<AnhSanPham>();

    // ===== Luật nghiệp vụ nằm ngay trong entity =====
    public void Duyet()
    {
        if (TrangThai != TrangThaiBaiDang.ChoDuyet)
            throw new DomainException("Chỉ bài đăng đang chờ duyệt mới được duyệt.");
        TrangThai = TrangThaiBaiDang.DaDuyet;
    }

    public void TuChoi()
    {
        if (TrangThai != TrangThaiBaiDang.ChoDuyet)
            throw new DomainException("Chỉ bài đăng đang chờ duyệt mới bị từ chối.");
        TrangThai = TrangThaiBaiDang.TuChoi;
    }
}
