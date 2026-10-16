using ChoDoCu.API.Extensions;
using ChoDoCu.API.Middlewares;
using ChoDoCu.API.Hubs;
using ChoDoCu.Application;
using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Infrastructure;
using ChoDoCu.Infrastructure.Data;
using ChoDoCu.Infrastructure.Data.Seed;
var builder = WebApplication.CreateBuilder(args);

// ===== Đăng ký service =====
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();

builder.Services.AddSignalR();
builder.Services.AddCorsPolicy();
builder.Services.AddJwtAuth(builder.Configuration);
builder.Services.AddSwaggerWithJwt();
builder.Services.AddScoped<IThongBaoNotifier, ThongBaoNotifier>(); 
builder.Services.AddScoped<IChatNotifier, ChatNotifier>();
builder.Services.AddScoped<IThongBaoNotifier, ThongBaoNotifier>();
var app = builder.Build();

// ===== Migrate + seed dữ liệu mẫu =====
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider
        .GetRequiredService<ApplicationDbContext>();

    await DbSeeder.SeedAsync(db);
}

// ===== Pipeline =====
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors(CorsExtensions.PolicyName);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");

app.Run();

public partial class Program { }
