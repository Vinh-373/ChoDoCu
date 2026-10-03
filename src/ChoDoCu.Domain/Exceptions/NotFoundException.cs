namespace ChoDoCu.Domain.Exceptions;

/// <summary>Không tìm thấy dữ liệu. API trả 404.</summary>
public class NotFoundException : Exception
{
    public NotFoundException(string tenDoiTuong, object id)
        : base($"Không tìm thấy {tenDoiTuong} (id = {id}).") { }
}
