using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Entities;

public class AnhSanPham : BaseEntity   // Id  <->  cột idAnhSanPham
{
    public int IdBaiDang { get; set; }
    public string Url { get; set; } = string.Empty;

    public BaiDang BaiDang { get; set; } = null!;
}
