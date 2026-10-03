using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IThongBaoRepository : IRepository<ThongBao>
{
    Task<(IReadOnlyList<ThongBao> Items, int TotalCount)> DanhSachTheoNguoiDungAsync(int idNguoiDung, int page, int pageSize);
    Task<int> DemChuaDocAsync(int idNguoiDung);
}
