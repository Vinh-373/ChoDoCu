namespace ChoDoCu.Domain.Enums;

// Tên giá trị phải trùng chuỗi lưu trong DB (cột baiDang.trangThai)
public enum TrangThaiBaiDang
{
    ChoDuyet = 0,
    DaDuyet = 1,
    BiTuChoi = 2,
    TuChoi = BiTuChoi,
    DaAn = 3,
    DaBan = 4
}
