using System.Text.Json;
using ChoDoCu.Domain.Exceptions;
using FluentValidation;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.API.Middlewares;

/// <summary>Bắt mọi exception và trả JSON thống nhất, controller không cần try/catch.</summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        // Client tự hủy request (đóng tab, timeout phía client): không phải lỗi hệ thống.
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            _logger.LogInformation("Client đã hủy request {Method} {Path}", context.Request.Method, context.Request.Path);
            context.Response.StatusCode = 499;
        }
        catch (Exception ex)
        {
            // Response đã bắt đầu gửi thì không thể ghi đè status/body nữa.
            if (context.Response.HasStarted)
            {
                _logger.LogError(ex, "Lỗi xảy ra sau khi response đã bắt đầu gửi");
                throw;
            }

            await XuLyLoiAsync(context, ex);
        }
    }

    private async Task XuLyLoiAsync(HttpContext context, Exception ex)
    {
        (int status, string code, string message, IDictionary<string, string[]>? errors) = ex switch
        {
            ValidationException ve => (
                StatusCodes.Status400BadRequest,
                "VALIDATION_ERROR",
                "Dữ liệu không hợp lệ.",
                (IDictionary<string, string[]>?)ve.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).Distinct().ToArray())),

            AppException ae => (ae.StatusCode, ae.ErrorCode, ae.Message, null),

            // JSON body sai định dạng, thiếu body, sai kiểu dữ liệu...
            BadHttpRequestException bad => (
                bad.StatusCode, "BAD_REQUEST", "Yêu cầu không hợp lệ.", null),
            JsonException => (
                StatusCodes.Status400BadRequest, "INVALID_JSON", "Nội dung JSON không hợp lệ.", null),

            // Hai người cùng sửa một bản ghi (dùng RowVersion/ConcurrencyToken).
            DbUpdateConcurrencyException => (
                StatusCodes.Status409Conflict, "CONCURRENCY_CONFLICT",
                "Dữ liệu đã bị thay đổi bởi người khác, vui lòng tải lại và thử lại.", null),

            // Chỉ chuyển lỗi unique key/index của SQL Server thành 409;
            // các lỗi database khác vẫn là 500.
            DbUpdateException db when LaViPhamKhoaDuyNhat(db) => (
                StatusCodes.Status409Conflict, "CONFLICT",
                "Dữ liệu đã tồn tại hoặc xung đột với dữ liệu hiện tại.", null),

            UnauthorizedAccessException => (
                StatusCodes.Status403Forbidden, "FORBIDDEN",
                "Bạn không có quyền thực hiện thao tác này.", null),

            _ => (
                StatusCodes.Status500InternalServerError, "INTERNAL_ERROR",
                "Lỗi hệ thống, vui lòng thử lại sau.", null)
        };

        // 5xx = lỗi của server → Error; 4xx = lỗi do client → Warning (không kèm stack trace cho đỡ ồn log).

        if (status >= 500)
        {
            _logger.LogError(
                ex,
                "Lỗi không xử lý được: {Method} {Path}. TraceId: {TraceId}",
                context.Request.Method,
                context.Request.Path,
                context.TraceIdentifier);
        }
        else
        {
            _logger.LogWarning(
                "Request bị từ chối ({Status} {Code}): {Message}. TraceId: {TraceId}",
                status,
                code,
                ex.Message,
                context.TraceIdentifier);
        }

        var body = new ErrorResponse
        {
            Status = status,
            Code = code,
            Message = message,
            Errors = errors,
            TraceId = context.TraceIdentifier,
            // Chỉ lộ chi tiết lỗi ở môi trường Development.
            Detail = status >= 500 && _env.IsDevelopment() ? ex.ToString() : null
        };

        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(body);
    }

    private static bool LaViPhamKhoaDuyNhat(DbUpdateException exception)
    {
        for (Exception? current = exception; current is not null; current = current.InnerException)
        {
            if (current is SqlException sqlException &&
                sqlException.Number is 2601 or 2627)
            {
                return true;
            }
        }

        return false;
    }
}

/// <summary>Cấu trúc JSON lỗi thống nhất cho toàn API.</summary>
public sealed class ErrorResponse
{
    public int Status { get; init; }
    public string Code { get; init; } = default!;
    public string Message { get; init; } = default!;
    public IDictionary<string, string[]>? Errors { get; init; }
    public string TraceId { get; init; } = default!;
    public string? Detail { get; init; }
}
