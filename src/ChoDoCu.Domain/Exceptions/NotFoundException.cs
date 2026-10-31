namespace ChoDoCu.Domain.Exceptions;

/// <summary>Không tìm thấy dữ liệu. API trả 404.</summary>
public class NotFoundException : AppException
{
    public NotFoundException(string tenDoiTuong, object id)
        : base($"Không tìm thấy {tenDoiTuong} (id = {id}).") { }

    public NotFoundException(string message) : base(message) { }

    public override int StatusCode => 404;
    public override string ErrorCode => "NOT_FOUND";
}