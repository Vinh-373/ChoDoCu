using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;

namespace ChoDoCu.Domain.Interfaces;

public interface INguoiDungRepository
{
    Task AddAsync(NguoiDung nguoiDung);
    Task<NguoiDung?> GetByIdAsync(int id);
    void Update(NguoiDung nguoiDung);
    void Remove(NguoiDung nguoiDung);

    Task<NguoiDung?> GetByEmailAsync(string email);
    Task<bool> EmailDaTonTaiAsync(string email);
    Task<bool> SoDienThoaiDaTonTaiAsync(string soDienThoai);

    /// <summary>SĐT đã thuộc về người dùng KHÁC (dùng khi cập nhật hồ sơ).</summary>
    Task<bool> SoDienThoaiDaDuocNguoiKhacDungAsync(string soDienThoai, int idNguoiDung);

    /// <summary>Lấy 1 người dùng kèm ThanhPho, PhuongXa (chỉ đọc, không theo dõi thay đổi).</summary>
    Task<NguoiDung?> GetKemDiaChiAsync(int id);

    /// <summary>Tìm kiếm + lọc + phân trang (mới nhất trước). role = tên Role (vd "Admin").</summary>
    Task<(IReadOnlyList<NguoiDung> Items, int Total)> TimKiemAsync(
        string? keyword, TrangThaiNguoiDung? trangThai, string? role, int page, int pageSize);

    /// <summary>Tên các Role của từng người dùng trong danh sách id.</summary>
    Task<Dictionary<int, List<string>>> LayRolesAsync(IEnumerable<int> idNguoiDungs);
}
