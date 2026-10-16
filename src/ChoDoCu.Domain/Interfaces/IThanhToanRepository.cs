using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IThanhToanRepository : IRepository<ThanhToan>
{
    Task<ThanhToan?> GetKemMuaDichVuTheoMaNgoaiAsync(string maGiaoDichNgoai);
    Task<ThanhToan?> GetCuaNguoiDungAsync(int idThanhToan, int idNguoiDung);
}
