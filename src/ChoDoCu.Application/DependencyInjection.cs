using ChoDoCu.Application.Features.Auth.Interfaces;
using ChoDoCu.Application.Features.Auth.Services;
using ChoDoCu.Application.Features.Banner.Interfaces;
using ChoDoCu.Application.Features.Banner.Services;
using ChoDoCu.Application.Features.Category.Interfaces;
using ChoDoCu.Application.Features.Category.Services;
using ChoDoCu.Application.Features.Chat.Interfaces;
using ChoDoCu.Application.Features.Chat.Services;
using ChoDoCu.Application.Features.Favorite.Interfaces;
using ChoDoCu.Application.Features.Favorite.Services;
using ChoDoCu.Application.Features.Location.Interfaces;
using ChoDoCu.Application.Features.Location.Services;
using ChoDoCu.Application.Features.Notification.Interfaces;
using ChoDoCu.Application.Features.Notification.Services;
using ChoDoCu.Application.Features.Payment.Interfaces;
using ChoDoCu.Application.Features.Payment.Services;
using ChoDoCu.Application.Features.Post.Interfaces;
using ChoDoCu.Application.Features.Post.Services;
using ChoDoCu.Application.Features.Report.Interfaces;
using ChoDoCu.Application.Features.Report.Services;
using ChoDoCu.Application.Features.Search.Interfaces;
using ChoDoCu.Application.Features.Search.Services;
using ChoDoCu.Application.Features.Service.Interfaces;
using ChoDoCu.Application.Features.Service.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ChoDoCu.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Tự tìm và đăng ký mọi Validator trong assembly này
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IBaiDangService, BaiDangService>();
        services.AddScoped<IDanhMucService, DanhMucService>();
        services.AddScoped<IDiaChiService, DiaChiService>();
        services.AddScoped<IYeuThichService, YeuThichService>();
        services.AddScoped<IThongBaoService, ThongBaoService>();
        services.AddScoped<IBaoCaoService, BaoCaoService>();
        services.AddScoped<ITinNhanService, TinNhanService>();
        services.AddScoped<ITimKiemService, TimKiemService>();
        services.AddScoped<IBannerService, BannerService>();
        services.AddScoped<IDichVuService, DichVuAppService>();
        services.AddScoped<IThanhToanService, ThanhToanService>();

        return services;
    }
}
