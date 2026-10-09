using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories
{
    public class RoleChucNangRepository : Repository<RoleChucNang>, IRoleChucNangRepository
    {
        public RoleChucNangRepository(ApplicationDbContext context) : base(context) { }
        
    }
}