using ChoDoCu.Domain.Exceptions;
using FluentValidation;

namespace ChoDoCu.API.Middlewares;

/// <summary>Bắt mọi exception và trả JSON thống nhất, controller không cần try/catch.</summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await XuLyLoiAsync(context, ex);
        }
    }

    private async Task XuLyLoiAsync(HttpContext context, Exception ex)
    {
        var (status, message, errors) = ex switch
        {
            ValidationException ve => (
                StatusCodes.Status400BadRequest,
                "Dữ liệu không hợp lệ.",
                (object?)ve.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())),
            NotFoundException => (StatusCodes.Status404NotFound, ex.Message, (object?)null),
            DomainException => (StatusCodes.Status400BadRequest, ex.Message, (object?)null),
            _ => (StatusCodes.Status500InternalServerError, "Lỗi hệ thống, vui lòng thử lại sau.", (object?)null)
        };

        if (status == StatusCodes.Status500InternalServerError)
            _logger.LogError(ex, "Lỗi không xử lý được");

        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(new { status, message, errors });
    }
}
