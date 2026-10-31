namespace ChoDoCu.Domain.Exceptions;

/// <summary>Thao tác xung đột với trạng thái hiện tại của dữ liệu (trùng, đã tồn tại...). API trả 409.</summary>
public class ConflictException : AppException
{
    public ConflictException(string message) : base(message) { }

    public override int StatusCode => 409;
    public override string ErrorCode => "CONFLICT";
}