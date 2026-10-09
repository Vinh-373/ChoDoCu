using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface INguoiDungRepository
{
    Task AddAsync(NguoiDung nguoiDung);
    Task<NguoiDung?> GetByIdAsync(int id);
    void Update(NguoiDung nguoiDung);
    void Remove(NguoiDung nguoiDung);

    Task<NguoiDung?> GetByEmailAsync(string email);
    Task<bool> EmailDaTonTaiAsync(string email);
    Task<bool> SoDienThoaiDaTonTaiAsync(string soDienThoai);
}
