using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using ChoDoCu.Infrastructure.Repositories;
using ChoDoCu.Infrastructure.Services;
using ChoDoCu.Infrastructure.Services.Payments;
using ChoDoCu.Application.Features.Payment.Interfaces;
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

        // ===== ASP.NET Core Identity =====
        services.AddIdentityCore<NguoiDung>(options =>
            {
                // Mật khẩu (phải khớp DangKyRequestValidator bên Application)
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 6;

                // Khóa tạm tài khoản khi đăng nhập sai liên tiếp (AuthService gọi AccessFailedAsync)
                options.Lockout.AllowedForNewUsers = true;
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);

                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<IdentityRole<int>>()                  // bảng AspNetRoles; quyền lưu ở AspNetRoleClaims
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();                  // Cần cho quên mật khẩu, xác thực email...

        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        // Đọc thông tin merchant/URL/khóa bí mật từ hai nhánh cấu hình thanh toán.
        services.Configure<MoMoSettings>(configuration.GetSection("Payment:MoMo"));
        services.Configure<VnPaySettings>(configuration.GetSection("Payment:VnPay"));

        // MoMo cần HttpClient để gọi API tạo yêu cầu; cả hai gateway cùng được cung cấp qua interface.
        services.AddHttpClient<MoMoGateway>();
        services.AddTransient<IPaymentGateway>(provider => provider.GetRequiredService<MoMoGateway>());
        services.AddTransient<IPaymentGateway, VnPayGateway>();
        services.Configure<EmailSettings>(configuration.GetSection("Email"));

        // Liên kết đặt lại mật khẩu hết hạn sau Email:ResetTokenHours giờ (mặc định 1)
        var tokenHours = configuration.GetValue<int?>("Email:ResetTokenHours") ?? 1;
        services.Configure<DataProtectionTokenProviderOptions>(o => o.TokenLifespan = TimeSpan.FromHours(tokenHours));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IAdminRepository, AdminRepository>();
        services.AddScoped<IJwtService, JwtService>();

        services.Configure<CloudinarySettings>(
            configuration.GetSection("Cloudinary"));

        services.AddScoped<IImageStorageService, CloudinaryImageStorageService>();
        services.AddScoped<IFileStorage, LocalFileStorage>();
        services.AddScoped<IEmailService, SmtpEmailService>();

        return services;
    }
}