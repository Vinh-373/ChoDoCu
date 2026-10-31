namespace ChoDoCu.Domain.Exceptions;

/// <summary>Người dùng không có quyền thực hiện thao tác trên dữ liệu.</summary>
public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message) { }
}
