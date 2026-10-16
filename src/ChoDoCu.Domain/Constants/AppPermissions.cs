namespace ChoDoCu.Domain.Constants;

/// <summary>
/// Mã quyền chi tiết. Dùng được trong attribute: [HasPermission(AppPermissions.BaiDangDuyet)].
/// Thêm quyền mới: khai báo hằng số + thêm vào All (và DefaultByRole nếu muốn gán sẵn) rồi chạy lại ứng dụng,
/// DbSeeder sẽ tự bổ sung vào DB.
/// </summary>
public static class AppPermissions
{
    /// <summary>Tên claim chứa quyền trong JWT.</summary>
    public const string ClaimType = "permission";

    public const string BaiDangTao = "BaiDang.Tao";
    public const string BaiDangDuyet = "BaiDang.Duyet";
    public const string BaiDangXoaBatKy = "BaiDang.XoaBatKy";

    public const string DanhMucQuanLy = "DanhMuc.QuanLy";
    public const string BannerQuanLy = "Banner.QuanLy";
    //public const string DichVuQuanLy = "DichVu.QuanLy";
    public const string BaoCaoXuLy = "BaoCao.XuLy";

    public const string NguoiDungXem = "NguoiDung.Xem";
    public const string NguoiDungKhoa = "NguoiDung.Khoa";
    public const string PhanQuyenQuanLy = "PhanQuyen.QuanLy";
    public const string ThanhToanXacNhan = "ThanhToan.XacNhan";

    /// Quyền liên quan đến dịch vụ (gói dịch vụ)
    public const string DichVuXem = "DichVu.Xem";
    public const string DichVuThem = "DichVu.Them";
    public const string DichVuSua = "DichVu.Sua";
    public const string DichVuXoa = "DichVu.Xoa";


    /// <summary>(Mã quyền, tên hiển thị) — nguồn dữ liệu seed cho bảng ChucNang.</summary>
    public static readonly IReadOnlyList<(string Ma, string Ten)> All = new List<(string, string)>
    {
        (BaiDangTao, "Đăng bài"),
        (BaiDangDuyet, "Duyệt / từ chối bài đăng"),
        (BaiDangXoaBatKy, "Xóa bài đăng của bất kỳ ai"),
        (DanhMucQuanLy, "Quản lý danh mục"),
        (BannerQuanLy, "Quản lý banner"),

        (DichVuXem, "Xem dịch vụ"),
        (DichVuThem, "Thêm dịch vụ"),
        (DichVuSua, "Sửa dịch vụ"),
        (DichVuXoa, "Xóa dịch vụ"),

        (BaoCaoXuLy, "Xử lý báo cáo vi phạm"),
        (NguoiDungXem, "Xem danh sách người dùng"),
        (NguoiDungKhoa, "Khóa / mở khóa người dùng"),
        (PhanQuyenQuanLy, "Quản lý vai trò và phân quyền"),
        (ThanhToanXacNhan, "Xác nhận thanh toán"),
    };

    /// <summary>Quyền gán sẵn cho từng Role khi seed lần đầu. Admin luôn có toàn bộ.</summary>
    public static readonly IReadOnlyDictionary<string, string[]> DefaultByRole = new Dictionary<string, string[]>
    {
        [AppRoles.Admin] = All.Select(x => x.Ma).ToArray(),
        [AppRoles.Moderator] = new[] { BaiDangTao, BaiDangDuyet, BaiDangXoaBatKy, BaoCaoXuLy, NguoiDungXem },
        [AppRoles.User] = new[] { BaiDangTao },
    };
}
