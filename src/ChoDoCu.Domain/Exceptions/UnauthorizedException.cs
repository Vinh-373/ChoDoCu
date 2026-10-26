namespace ChoDoCu.Domain.Exceptions;

/// <summary>Chưa đăng nhập, token sai hoặc hết hạn, sai tài khoản/mật khẩu. API trả 401.</summary>
public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.")
        : base(message) { }

    public override int StatusCode => 401;
    public override string ErrorCode => "UNAUTHORIZED";
}