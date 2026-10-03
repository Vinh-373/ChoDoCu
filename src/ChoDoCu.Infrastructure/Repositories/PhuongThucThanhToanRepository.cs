using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;

namespace ChoDoCu.Infrastructure.Repositories;

public class PhuongThucThanhToanRepository : Repository<PhuongThucThanhToan>, IPhuongThucThanhToanRepository
{
    public PhuongThucThanhToanRepository(ApplicationDbContext context) : base(context) { }
}