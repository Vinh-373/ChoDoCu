namespace ChoDoCu.Domain.Common;

/// <summary>
/// Lớp cha của mọi entity. Chỉ giữ khóa chính "Id".
/// Tên cột thật trong DB (idBaiDang, idSanPham...) được map ở lớp Configuration bên Infrastructure.
/// </summary>
public abstract class BaseEntity
{
    public int Id { get; set; }
}
