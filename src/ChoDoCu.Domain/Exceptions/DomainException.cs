namespace ChoDoCu.Domain.Exceptions;

/// <summary>Vi phạm luật nghiệp vụ (vd: duyệt bài không ở trạng thái chờ duyệt). API trả 400.</summary>
public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}
