using ChoDoCu.Application.Features.Search.DTOs;

namespace ChoDoCu.Application.Features.Search.Interfaces;

public interface ITimKiemService
{
    /// <summary>Ghi lại từ khóa người dùng đã tìm (gọi khi FE gọi API tìm bài đăng có đăng nhập).</summary>
    Task GhiLaiAsync(int idNguoiDung, string tuKhoa);
    Task<List<LichSuTimKiemResponse>> LichSuGanNhatAsync(int idNguoiDung, int soLuong = 10);
}
