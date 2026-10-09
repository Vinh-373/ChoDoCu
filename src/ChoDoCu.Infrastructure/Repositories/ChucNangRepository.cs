
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;


namespace ChoDoCu.Infrastructure.Repositories
{
    public class ChucNangRepository : Repository<ChucNang>, IChucNangRepository
    {
        public ChucNangRepository(ApplicationDbContext context) : base(context) { }
        
        
    }
}