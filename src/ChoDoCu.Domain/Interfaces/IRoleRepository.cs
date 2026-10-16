using Microsoft.AspNetCore.Identity;

namespace ChoDoCu.Domain.Interfaces.Repositories.Authorization;

public interface IRoleRepository
{
    Task<IReadOnlyList<IdentityRole<int>>> GetAllAsync();

    Task<IdentityRole<int>?> GetByIdAsync(int id);

    Task<bool> ExistsByNameAsync(string name);
}