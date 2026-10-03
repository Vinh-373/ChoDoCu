using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IDanhMucRepository : IRepository<DanhMuc>
{
    /// <summary>Toàn bộ cây danh mục (cha + con), dùng cho trang chủ / menu lọc.</summary>
    Task<IReadOnlyList<DanhMuc>> GetCayDanhMucAsync();
    Task<bool> CoDanhMucConAsync(int idDanhMuc);
}
