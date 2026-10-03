namespace ChoDoCu.API.Extensions;

public static class CorsExtensions
{
    public const string PolicyName = "DefaultCors";

    public static IServiceCollection AddCorsPolicy(this IServiceCollection services)
    {
        services.AddCors(options =>
            options.AddPolicy(PolicyName, policy => policy
                .WithOrigins("http://localhost:3000", "http://localhost:5173")   // địa chỉ frontend
                .AllowAnyHeader()
                .AllowAnyMethod()));
        return services;
    }
}
