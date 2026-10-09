using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore; 

namespace ChoDoCu.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<NguoiDung, Role, int>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    //public DbSet<NguoiDung> NguoiDungs => Set<NguoiDung>();
    //public DbSet<Role> Roles => Set<Role>();
    public DbSet<DanhMuc> DanhMucs => Set<DanhMuc>();
    public DbSet<SanPham> SanPhams => Set<SanPham>();
    public DbSet<AnhSanPham> AnhSanPhams => Set<AnhSanPham>();
    public DbSet<ThuocTinhSanPham> ThuocTinhSanPhams => Set<ThuocTinhSanPham>();
    public DbSet<SanPhamThuocTinh> SanPhamThuocTinhs => Set<SanPhamThuocTinh>();
    public DbSet<BaiDang> BaiDangs => Set<BaiDang>();
    public DbSet<ThanhPho> ThanhPhos => Set<ThanhPho>();
    public DbSet<PhuongXa> PhuongXas => Set<PhuongXa>();
    public DbSet<DichVu> DichVus => Set<DichVu>();
    public DbSet<MuaDichVu> MuaDichVus => Set<MuaDichVu>();
    public DbSet<ThanhToan> ThanhToans => Set<ThanhToan>();
    public DbSet<BaoCao> BaoCaos => Set<BaoCao>();
    public DbSet<ThongBao> ThongBaos => Set<ThongBao>();
    public DbSet<YeuThich> YeuThichs => Set<YeuThich>();
    public DbSet<HoiThoai> HoiThois => Set<HoiThoai>();
    public DbSet<TinNhan> TinNhans => Set<TinNhan>();
    public DbSet<LichSuTimKiem> LichSuTimKiems => Set<LichSuTimKiem>();
    public DbSet<Banner> Banners => Set<Banner>();
    public DbSet<Hang> Hangs => Set<Hang>();
    public DbSet<DongSanPham> DongSanPhams => Set<DongSanPham>();
    public DbSet<DongCuThe> DongCuThes => Set<DongCuThe>();
    public DbSet<PhuongThucThanhToan> PhuongThucThanhToans => Set<PhuongThucThanhToan>();
    public DbSet<ChucNang> ChucNangs => Set<ChucNang>();
    public DbSet<RoleChucNang> RoleChucNangs => Set<RoleChucNang>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Đặt tên bảng cho các entity kế thừa IdentityUser và IdentityRole
        modelBuilder.Entity<NguoiDung>().ToTable("NguoiDungs");
        modelBuilder.Entity<Role>().ToTable("Roles");
        // Quy ước: thuộc tính PascalCase -> cột camelCase (TieuDe -> tieuDe).
        // Chạy TRƯỚC khi áp Configuration để Configuration có thể ghi đè khi cần (Id, PasswordHash...).
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
            foreach (var property in entity.GetProperties())
                property.SetColumnName(ToCamelCase(property.Name));

        // Nạp mọi lớp IEntityTypeConfiguration<T> trong thư mục Configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    private static string ToCamelCase(string name) =>
        string.IsNullOrEmpty(name) ? name : char.ToLowerInvariant(name[0]) + name[1..];
}
