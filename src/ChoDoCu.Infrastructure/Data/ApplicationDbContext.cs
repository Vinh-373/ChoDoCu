using ChoDoCu.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data;

namespace ChoDoCu.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<NguoiDung, IdentityRole<int>, int>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<DanhMuc> DanhMucs => Set<DanhMuc>();
    public DbSet<SanPham> SanPhams => Set<SanPham>();
    public DbSet<AnhSanPham> AnhSanPhams => Set<AnhSanPham>();
    public DbSet<ThuocTinhSanPham> ThuocTinhSanPhams => Set<ThuocTinhSanPham>();
    public DbSet<SanPhamThuocTinh> SanPhamThuocTinhs => Set<SanPhamThuocTinh>();
    public DbSet<BaiDang> BaiDangs => Set<BaiDang>();
    public DbSet<HinhAnhBaiDang> HinhAnhBaiDangs => Set<HinhAnhBaiDang>();
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

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        GenerateMaTinForNewPosts();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override async Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        await GenerateMaTinForNewPostsAsync(cancellationToken);
        return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasSequence<int>("maTinSequence", "dbo")
            .StartsAt(0)
            .IncrementsBy(1)
            .HasMax(99_999);

        // Quy ước: thuộc tính PascalCase -> cột camelCase (TieuDe -> tieuDe).
        // Chạy TRƯỚC khi áp Configuration để Configuration có thể ghi đè khi cần.
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
            foreach (var property in entity.GetProperties())
                property.SetColumnName(ToCamelCase(property.Name));

        // Nạp mọi lớp IEntityTypeConfiguration<T> trong assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    private static string ToCamelCase(string name) =>
        string.IsNullOrEmpty(name) ? name : char.ToLowerInvariant(name[0]) + name[1..];

    private void GenerateMaTinForNewPosts()
    {
        foreach (var entry in ChangeTracker.Entries<BaiDang>())
        {
            if (entry.State == EntityState.Added && string.IsNullOrWhiteSpace(entry.Entity.MaTin))
                entry.Entity.MaTin = $"T{GetNextMaTinNumber():D5}";
            else if (entry.State == EntityState.Modified)
                entry.Entity.NgayCapNhat = DateTime.Now;
        }
    }

    private async Task GenerateMaTinForNewPostsAsync(CancellationToken cancellationToken)
    {
        foreach (var entry in ChangeTracker.Entries<BaiDang>())
        {
            if (entry.State == EntityState.Added && string.IsNullOrWhiteSpace(entry.Entity.MaTin))
                entry.Entity.MaTin = $"T{await GetNextMaTinNumberAsync(cancellationToken):D5}";
            else if (entry.State == EntityState.Modified)
                entry.Entity.NgayCapNhat = DateTime.Now;
        }
    }

    private int GetNextMaTinNumber()
    {
        var connection = Database.GetDbConnection();
        var openedConnection = connection.State != ConnectionState.Open;
        if (openedConnection)
            connection.Open();

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = "SELECT NEXT VALUE FOR dbo.maTinSequence";
            command.Transaction = Database.CurrentTransaction?.GetDbTransaction();
            var value = command.ExecuteScalar()
                ?? throw new InvalidOperationException("Không thể tạo mã tin từ sequence.");
            return Convert.ToInt32(value);
        }
        finally
        {
            if (openedConnection)
                connection.Close();
        }
    }

    private async Task<int> GetNextMaTinNumberAsync(CancellationToken cancellationToken)
    {
        var connection = Database.GetDbConnection();
        var openedConnection = connection.State != ConnectionState.Open;
        if (openedConnection)
            await connection.OpenAsync(cancellationToken);

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT NEXT VALUE FOR dbo.maTinSequence";
            command.Transaction = Database.CurrentTransaction?.GetDbTransaction();
            var value = await command.ExecuteScalarAsync(cancellationToken)
                ?? throw new InvalidOperationException("Không thể tạo mã tin từ sequence.");
            return Convert.ToInt32(value);
        }
        finally
        {
            if (openedConnection)
                await connection.CloseAsync();
        }
    }
}