using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IBaiDangRepository : IRepository<BaiDang>
{
    /// <summary>Lấy bài đăng kèm sản phẩm, người đăng, danh mục, thành phố, ảnh.</summary>
    Task<BaiDang?> GetChiTietAsync(int id);

    /// <summary>Tìm các bài ĐÃ DUYỆT, có phân trang. Bài ưu tiên (mua gói) lên đầu.</summary>
    Task<(IReadOnlyList<BaiDang> Items, int TotalCount)> TimKiemAsync(
        int? idDanhMuc, int? idThanhPho, string? tuKhoa, int page, int pageSize);
}
