using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class PhuongXa : BaseEntity   // Id  <->  cột idPhuongXa
{
    public int IdThanhPho { get; set; }
    public string TenPhuongXa { get; set; } = string.Empty;

    public ThanhPho ThanhPho { get; set; } = null!;
}
