namespace ChoDoCu.Application.Features.Post.DTOs;

public record TaoBaiDangRequest(
    string TieuDe,
    string NoiDung,
    string TenSanPham,
    decimal GiaTien,
    string MoTa,
    int IdDanhMuc,
    int IdThanhPho,
    int? IdPhuongXa,
    string DiaChi,
    string DiaChiChiTiet,
    List<string> UrlAnhs);

public record BaiDangResponse(
    int Id,
    string TieuDe,
    string NoiDung,
    string TenSanPham,
    decimal GiaTien,
    string DiaChi,
    string DiaChiChiTiet,
    DateTime NgayDang,
    string TrangThai,
    int IdNguoiDung,
    string TenNguoiDang,
    string TenDanhMuc,
    string TenThanhPho,
    List<string> Anhs);
