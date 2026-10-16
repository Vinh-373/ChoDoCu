namespace ChoDoCu.Domain.Interfaces;

/// <summary>
/// Gom mọi repository và lưu MỘT LẦN: mọi thay đổi trong một use case thành công hoặc thất bại cùng nhau.
/// </summary>
public interface IUnitOfWork
{
    IBaiDangRepository BaiDangs { get; }
    INguoiDungRepository NguoiDungs { get; }
    IDanhMucRepository DanhMucs { get; }
    IThanhPhoRepository ThanhPhos { get; }
    IPhuongXaRepository PhuongXas { get; }
    IYeuThichRepository YeuThichs { get; }
    IThongBaoRepository ThongBaos { get; }
    IBaoCaoRepository BaoCaos { get; }
    IPhuongThucThanhToanRepository PhuongThucThanhToans { get; }
    IHoiThoaiRepository HoiThois { get; }
    ITinNhanRepository TinNhans { get; }
    IDichVuRepository DichVus { get; }
    IMuaDichVuRepository MuaDichVus { get; }
    IThanhToanRepository ThanhToans { get; }
    ILichSuTimKiemRepository LichSuTimKiems { get; }
    IBannerRepository Banners { get; }

    Task<int> SaveChangesAsync();
}
