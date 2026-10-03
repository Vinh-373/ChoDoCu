using ChoDoCu.API.Extensions;
using ChoDoCu.API.Middlewares;
using ChoDoCu.Application;
using ChoDoCu.Infrastructure;
using ChoDoCu.Infrastructure.Data;
using ChoDoCu.Infrastructure.Data.Seed;

var builder = WebApplication.CreateBuilder(args);

// ===== Đăng ký service =====
builder.Services.AddApplication();                          // Application layer
builder.Services.AddInfrastructure(builder.Configuration);  // Infrastructure layer (DB, JWT, ...)
builder.Services.AddControllers();
builder.Services.AddSwaggerWithJwt();
builder.Services.AddJwtAuth(builder.Configuration);
builder.Services.AddCorsPolicy();

var app = builder.Build();

// ===== Migrate + seed dữ liệu mẫu khi chạy môi trường Development =====
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DbSeeder.SeedAsync(db);
}

// ===== Pipeline (thứ tự quan trọng) =====
app.UseMiddleware<ExceptionHandlingMiddleware>();           // đặt đầu tiên để bắt mọi lỗi phía sau

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();                                       // phục vụ ảnh trong wwwroot/uploads
app.UseCors(CorsExtensions.PolicyName);
app.UseAuthentication();                                    // "bạn là ai"  (phải trước Authorization)
app.UseAuthorization();                                     // "bạn được làm gì"
app.MapControllers();

app.Run();

// Cho phép test tích hợp (WebApplicationFactory<Program>) truy cập
public partial class Program { }
