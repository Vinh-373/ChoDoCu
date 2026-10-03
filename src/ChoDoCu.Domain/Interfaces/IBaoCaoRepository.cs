using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IBaoCaoRepository : IRepository<BaoCao>
{
    Task<BaoCao?> GetChiTietAsync(int id);
    Task<(IReadOnlyList<BaoCao> Items, int TotalCount)> DanhSachAsync(string? trangThai, int page, int pageSize);
}
