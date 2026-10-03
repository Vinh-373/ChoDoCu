using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class SanPhamConfiguration : IEntityTypeConfiguration<SanPham>
{
    public void Configure(EntityTypeBuilder<SanPham> builder)
    {
        builder.ToTable("sanPham");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idSanPham");

        builder.Property(x => x.TenSanPham).HasMaxLength(255).IsRequired();
        builder.Property(x => x.GiaTien).HasPrecision(18, 2);
        builder.Property(x => x.MoTa).IsRequired();   // NVARCHAR(MAX)

        builder.HasOne(x => x.DanhMuc).WithMany(x => x.SanPhams)
            .HasForeignKey(x => x.IdDanhMuc).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Hang).WithMany(x => x.SanPhams)
    .HasForeignKey(x => x.IdHang).OnDelete(DeleteBehavior.Restrict);
builder.HasOne(x => x.DongSanPham).WithMany(x => x.SanPhams)
    .HasForeignKey(x => x.IdDongSanPham).OnDelete(DeleteBehavior.Restrict);
builder.HasOne(x => x.DongCuThe).WithMany(x => x.SanPhams)
    .HasForeignKey(x => x.IdDongCuThe).OnDelete(DeleteBehavior.Restrict);
    }
}
