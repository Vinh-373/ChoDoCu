namespace ChoDoCu.Domain.Entities;

public class HinhAnhBaiDang
{
    public int IdBaiDang { get; set; }
    public string DuongDan { get; set; } = string.Empty;
    public bool LaVideo { get; set; }
    public bool LaAnhBia { get; set; }
    public int ThuTu { get; set; }

    public BaiDang BaiDang { get; set; } = null!;
}
