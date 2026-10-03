using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IBannerRepository : IRepository<Banner>
{
    Task<IReadOnlyList<Banner>> DanhSachTheoViTriAsync(string? viTri);
}
