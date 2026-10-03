using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface INguoiDungRepository : IRepository<NguoiDung>
{
    Task<NguoiDung?> GetByEmailAsync(string email);
    Task<bool> EmailDaTonTaiAsync(string email);
    Task<bool> SoDienThoaiDaTonTaiAsync(string soDienThoai);
}
