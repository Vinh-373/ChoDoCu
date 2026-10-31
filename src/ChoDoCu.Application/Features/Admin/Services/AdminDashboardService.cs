using ChoDoCu.Application.Features.Admin.DTOs;
using ChoDoCu.Application.Features.Admin.Interfaces;
using ChoDoCu.Domain.Interfaces;

namespace ChoDoCu.Application.Features.Admin.Services;

public sealed class AdminDashboardService : IAdminDashboardService
{
    private readonly IAdminRepository _repository;

    public AdminDashboardService(IAdminRepository repository) => _repository = repository;

    public async Task<AdminDashboardResponse> GetDashboardAsync()
    {
        var counts = await _repository.GetDashboardCountsAsync();
        return new AdminDashboardResponse(counts.Users, counts.Posts, counts.Transactions, counts.Reports);
    }
}
