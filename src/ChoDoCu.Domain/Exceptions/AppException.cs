namespace ChoDoCu.Domain.Exceptions;

/// <summary>Lớp cha cho mọi lỗi nghiệp vụ có thể dự đoán. Mỗi lớp con tự khai báo HTTP status.</summary>
public abstract class AppException : Exception
{
    protected AppException(string message) : base(message) { }

    /// <summary>HTTP status code tương ứng.</summary>
    public abstract int StatusCode { get; }

    /// <summary>Mã lỗi ngắn gọn để frontend xử lý theo logic (vd: "NOT_FOUND").</summary>
    public abstract string ErrorCode { get; }
}