// using ChoDoCu.API.Extensions;
// using ChoDoCu.API.Middlewares;
// using ChoDoCu.API.Hubs;
// using ChoDoCu.Application;
// using ChoDoCu.Application.Common.Interfaces;
// using ChoDoCu.Infrastructure;
// using ChoDoCu.Infrastructure.Data.Seed;

// var builder = WebApplication.CreateBuilder(args);

// // ===== Đăng ký service =====
// builder.Services.AddApplication();
// builder.Services.AddInfrastructure(builder.Configuration);
// builder.Services.AddControllers();

// builder.Services.AddSwaggerWithJwt();
// builder.Services.AddJwtAuth(builder.Configuration);
// builder.Services.AddPermissionAuthorization();
// builder.Services.AddCorsPolicy();

// builder.Services.AddSignalR();

// builder.Services.AddScoped<IThongBaoNotifier, ThongBaoNotifier>();
// builder.Services.AddScoped<IChatNotifier, ChatNotifier>();

// var app = builder.Build();

// // ===== Migrate + seed dữ liệu mẫu =====
// if (app.Environment.IsDevelopment())
// {
//     await DbSeeder.SeedAsync(app.Services);
// }

// // ===== Pipeline =====
// app.UseMiddleware<ExceptionHandlingMiddleware>();

// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

// app.UseHttpsRedirection();
// app.UseStaticFiles();

// app.UseCors(CorsExtensions.PolicyName);

// app.UseAuthentication();
// app.UseAuthorization();

// app.MapControllers();
// app.MapHub<ChatHub>("/hubs/chat");

// app.Run();

// public partial class Program { }


using ChoDoCu.API.Extensions;
using ChoDoCu.API.Middlewares;
using ChoDoCu.API.Hubs;
using ChoDoCu.Application;
using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Infrastructure;
using ChoDoCu.Infrastructure.Data.Seed;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// ===== Đăng ký service =====
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Lỗi model binding/[ApiController] cũng trả cùng định dạng ErrorResponse.
        options.InvalidModelStateResponseFactory = ctx =>
        {
            var errors = ctx.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    e => e.Key,
                    e => e.Value!.Errors
                        .Select(x => string.IsNullOrWhiteSpace(x.ErrorMessage) ? "Giá trị không hợp lệ." : x.ErrorMessage)
                        .ToArray());

            return new BadRequestObjectResult(new ErrorResponse
            {
                Status = StatusCodes.Status400BadRequest,
                Code = "VALIDATION_ERROR",
                Message = "Dữ liệu không hợp lệ.",
                Errors = errors,
                TraceId = ctx.HttpContext.TraceIdentifier
            });
        };
    });

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
app.UseExceptionHandling();   // đầu tiên để bọc toàn bộ phía sau

// Trả JSON cho 401/403/404/405 do framework tự sinh (không có exception).
app.UseStatusCodePages(async ctx =>
{
    var res = ctx.HttpContext.Response;
    if (res.HasStarted || res.ContentLength > 0 || !string.IsNullOrEmpty(res.ContentType)) return;

    var (code, message) = res.StatusCode switch
    {
        400 => ("BAD_REQUEST", "Yêu cầu không hợp lệ."),
        401 => ("UNAUTHORIZED", "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."),
        403 => ("FORBIDDEN", "Bạn không có quyền thực hiện thao tác này."),
        404 => ("NOT_FOUND", "Không tìm thấy tài nguyên."),
        405 => ("METHOD_NOT_ALLOWED", "Phương thức không được hỗ trợ."),
        409 => ("CONFLICT", "Yêu cầu xung đột với trạng thái hiện tại của dữ liệu."),
        500 => ("INTERNAL_ERROR", "Lỗi hệ thống, vui lòng thử lại sau."),
        _ => ("ERROR", "Yêu cầu không thành công.")
    };

    await res.WriteAsJsonAsync(new ErrorResponse
    {
        Status = res.StatusCode,
        Code = code,
        Message = message,
        TraceId = ctx.HttpContext.TraceIdentifier
    });
});

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