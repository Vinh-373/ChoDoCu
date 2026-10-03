namespace ChoDoCu.Application.Common.Models;

/// <summary>Kết quả thành công/thất bại có thể đoán trước (vd: sai mật khẩu). Lỗi bất ngờ dùng Exception.</summary>
public class Result<T>
{
    public bool IsSuccess { get; private set; }
    public T? Data { get; private set; }
    public string? Error { get; private set; }

    public static Result<T> Ok(T data) => new() { IsSuccess = true, Data = data };
    public static Result<T> Fail(string error) => new() { IsSuccess = false, Error = error };
}
