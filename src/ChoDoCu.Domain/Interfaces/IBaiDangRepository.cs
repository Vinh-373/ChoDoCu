using System.Linq.Expressions;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;

namespace ChoDoCu.Domain.Interfaces;

public interface IBaiDangRepository : IRepository<BaiDang>
{
    /// <summary>Lấy bài đăng kèm sản phẩm, người đăng, danh mục, thành phố, ảnh.</summary>
    Task<BaiDang?> GetChiTietAsync(int id);
    Task<bool> IsSanPhamUsedByOtherBaiDangAsync(int idSanPham, int idBaiDang);
    void RemoveWithSanPham(BaiDang baiDang, bool xoaSanPham);
    Task<IReadOnlyCollection<string>> GetDuongDanDangSuDungAsync(
        IReadOnlyCollection<string> duongDans);

    /// <summary>Lưu bài đăng và cập nhật mã tin theo ID trong cùng một transaction.</summary>
    Task AddWithGeneratedMaTinAsync(BaiDang baiDang);

    /// <summary>Tìm các bài ĐÃ DUYỆT, có phân trang. Bài ưu tiên (mua gói) lên đầu.</summary>
    Task<(IReadOnlyList<BaiDang> Items, int TotalCount)> TimKiemAsync(
        int? idDanhMuc,
        int? idThanhPho,
        int? idPhuongXa,
        string? keyword,
        decimal? giaTu,
        decimal? giaDen,
        string sapXep,
        int page,
        int pageSize);

    Task<(IReadOnlyList<TProjection> Items, int TotalCount)> DanhSachCuaToiAsync<TProjection>(
        int idNguoiDung,
        TrangThaiBaiDang? trangThai,
        string? keyword,
        int? idDanhMuc,
        string sapXep,
        int page,
        int pageSize,
        Expression<Func<BaiDang, TProjection>> selector);

    Task<(IReadOnlyList<TProjection> Items, int TotalCount)> DanhSachChoDuyetAsync<TProjection>(
        string? keyword,
        int? idDanhMuc,
        int page,
        int pageSize,
        Expression<Func<BaiDang, TProjection>> selector);

    Task<IReadOnlyDictionary<TrangThaiBaiDang, int>> ThongKeCuaToiAsync(int idNguoiDung);

    Task<TProjection?> GetChiTietProjectionAsync<TProjection>(
        int id,
        Expression<Func<BaiDang, TProjection>> selector);

    Task<IReadOnlyList<HinhAnhBaiDang>> GetHinhAnhChiTietAsync(int id);

    Task<IReadOnlyList<AnhSanPham>> GetAnhSanPhamChiTietAsync(int id);

    Task<IReadOnlyList<TProjection>> GetThuocTinhChiTietAsync<TProjection>(
        int id,
        Expression<Func<SanPhamThuocTinh, TProjection>> selector);

    Task TangLuotXemAsync(int id);
    Task<bool> TryDayTinAsync(int id, int idNguoiDung, DateTime now);
    Task<bool> GiaHanAsync(int id, int idNguoiDung, DateTime now, int soNgay);
}
