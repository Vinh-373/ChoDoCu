using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class BaiDangConfiguration : IEntityTypeConfiguration<BaiDang>
{
    public void Configure(EntityTypeBuilder<BaiDang> builder)
    {
        builder.ToTable("baiDang");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idBaiDang");

        builder.Property(x => x.TieuDe).HasMaxLength(255).IsRequired();
        builder.Property(x => x.NoiDung).IsRequired();              // NVARCHAR(MAX)
        builder.Property(x => x.DiaChi).HasMaxLength(255).IsRequired();
        builder.Property(x => x.DiaChiChiTiet).HasMaxLength(255).IsRequired();
        builder.Property(x => x.TrangThai).HasConversion<string>().HasMaxLength(50);

        // Quan hệ 1-1: BaiDang (phụ thuộc) -> SanPham (chính); unique index trên idSanPham
        builder.HasIndex(x => x.IdSanPham).IsUnique();
        builder.HasOne(x => x.SanPham).WithOne(x => x.BaiDang)
            .HasForeignKey<BaiDang>(x => x.IdSanPham).OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.NguoiDung).WithMany(x => x.BaiDangs)
            .HasForeignKey(x => x.IdNguoiDung).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.DanhMuc).WithMany()
            .HasForeignKey(x => x.IdDanhMuc).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ThanhPho).WithMany()
            .HasForeignKey(x => x.IdThanhPho).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.PhuongXa).WithMany()
            .HasForeignKey(x => x.IdPhuongXa).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.DichVu).WithMany()
            .HasForeignKey(x => x.IdDichVu).OnDelete(DeleteBehavior.Restrict);

        // Xóa bài đăng thì xóa luôn ảnh
        builder.HasMany(x => x.AnhSanPhams).WithOne(x => x.BaiDang)
            .HasForeignKey(x => x.IdBaiDang).OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.TrangThai, x.NgayDang });
    }
}
