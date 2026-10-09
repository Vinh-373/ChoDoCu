using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;

namespace ChoDoCu.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;

        BaiDangs = new BaiDangRepository(context);
        NguoiDungs = new NguoiDungRepository(context);
        DanhMucs = new DanhMucRepository(context);
        ThanhPhos = new ThanhPhoRepository(context);
        PhuongXas = new PhuongXaRepository(context);
        YeuThichs = new YeuThichRepository(context);
        ThongBaos = new ThongBaoRepository(context);
        BaoCaos = new BaoCaoRepository(context);
        HoiThois = new HoiThoaiRepository(context);
        TinNhans = new TinNhanRepository(context);
        PhuongThucThanhToans = new PhuongThucThanhToanRepository(context);
        DichVus = new DichVuRepository(context);
        MuaDichVus = new MuaDichVuRepository(context);
        ThanhToans = new ThanhToanRepository(context);
        LichSuTimKiems = new LichSuTimKiemRepository(context);
        Banners = new BannerRepository(context);
        ChucNangs = new ChucNangRepository(context);
        RoleChucNangs = new RoleChucNangRepository(context);    
    }

    public IBaiDangRepository BaiDangs { get; }
    public INguoiDungRepository NguoiDungs { get; }
    public IDanhMucRepository DanhMucs { get; }
    public IThanhPhoRepository ThanhPhos { get; }
    public IPhuongXaRepository PhuongXas { get; }
    public IYeuThichRepository YeuThichs { get; }
    public IThongBaoRepository ThongBaos { get; }
    public IBaoCaoRepository BaoCaos { get; }
    public IHoiThoaiRepository HoiThois { get; }
    public ITinNhanRepository TinNhans { get; }
    public IPhuongThucThanhToanRepository PhuongThucThanhToans { get; }
    public IDichVuRepository DichVus { get; }
    public IMuaDichVuRepository MuaDichVus { get; }
    public IThanhToanRepository ThanhToans { get; }
    public ILichSuTimKiemRepository LichSuTimKiems { get; }
    public IBannerRepository Banners { get; }
    public IChucNangRepository ChucNangs { get; }
    public IRoleChucNangRepository RoleChucNangs { get; }

    public Task<int> SaveChangesAsync() => _context.SaveChangesAsync();
}