using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Domain.Interfaces;

public interface IMuaDichVuRepository : IRepository<MuaDichVu>
{
    Task<MuaDichVu?> GetKemDichVuAsync(int id);
}
