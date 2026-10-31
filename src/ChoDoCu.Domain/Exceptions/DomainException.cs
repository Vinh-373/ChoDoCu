namespace ChoDoCu.Domain.Exceptions;

/// <summary>Vi phạm luật nghiệp vụ (vd: duyệt bài không ở trạng thái chờ duyệt). API trả 400.</summary>
public class DomainException : AppException
{
    public DomainException(string message) : base(message) { }

    public override int StatusCode => 400;
    public override string ErrorCode => "DOMAIN_ERROR";
}