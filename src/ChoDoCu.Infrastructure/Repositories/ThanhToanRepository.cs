using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;

namespace ChoDoCu.Infrastructure.Repositories;

public class ThanhToanRepository : Repository<ThanhToan>, IThanhToanRepository
{
    public ThanhToanRepository(ApplicationDbContext context) : base(context) { }
}
