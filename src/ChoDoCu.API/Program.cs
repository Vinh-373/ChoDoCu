using ChoDoCu.API.Extensions;
using ChoDoCu.API.Middlewares;
using ChoDoCu.API.Hubs;
using ChoDoCu.Application;
using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Infrastructure;
using ChoDoCu.Infrastructure.Data.Seed;

var builder = WebApplication.CreateBuilder(args);

// ===== Đăng ký service =====
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();

builder.Services.AddSwaggerWithJwt();
builder.Services.AddJwtAuth(builder.Configuration);
builder.Services.AddPermissionAuthorization();
builder.Services.AddCorsPolicy();

builder.Services.AddSignalR();

builder.Services.AddScoped<IThongBaoNotifier, ThongBaoNotifier>();
builder.Services.AddScoped<IChatNotifier, ChatNotifier>();

var app = builder.Build();

// ===== Migrate + seed dữ liệu mẫu =====
if (app.Environment.IsDevelopment())
{
    await DbSeeder.SeedAsync(app.Services);
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
