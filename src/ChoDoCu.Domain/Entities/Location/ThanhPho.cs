using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class ThanhPho : BaseEntity   // Id  <->  cột idThanhPho
{
    public string TenThanhPho { get; set; } = string.Empty;

    public ICollection<PhuongXa> PhuongXas { get; set; } = new List<PhuongXa>();
}
