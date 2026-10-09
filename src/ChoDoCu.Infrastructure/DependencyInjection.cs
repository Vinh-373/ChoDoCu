using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using ChoDoCu.Infrastructure.Repositories;
using ChoDoCu.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChoDoCu.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // Dòng đăng ký cũ (hiện giữ lại dưới dạng comment):
        // services.AddScoped<IPasswordHasher, PasswordHasher>();
        // Cấu hình hiện tại dùng ASP.NET Core Identity với khóa int.
        services.AddIdentityCore<NguoiDung>()
            .AddRoles<Role>()
            .AddEntityFrameworkStores<ApplicationDbContext>();

        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IJwtService, JwtService>();
        // Thêm IFileStorage, IEmailService... ở đây

        return services;
    }
}
