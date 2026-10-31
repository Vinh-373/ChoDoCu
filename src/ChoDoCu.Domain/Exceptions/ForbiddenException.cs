namespace ChoDoCu.Domain.Exceptions;

/// <summary>Đã đăng nhập nhưng không có quyền thực hiện thao tác. API trả 403.</summary>
public class ForbiddenException : AppException
{
    public ForbiddenException(string message = "Bạn không có quyền thực hiện thao tác này.")
        : base(message) { }

    public override int StatusCode => 403;
    public override string ErrorCode => "FORBIDDEN";
}
