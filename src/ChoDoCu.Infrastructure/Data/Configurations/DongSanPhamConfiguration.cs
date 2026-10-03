using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;
public class DongSanPhamConfiguration : IEntityTypeConfiguration<DongSanPham>
{
    public void Configure(EntityTypeBuilder<DongSanPham> builder)
    {
        builder.ToTable("dongSanPham");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idDongSanPham");
        builder.Property(x => x.TenDongSanPham).HasMaxLength(255);
        builder.Property(x => x.TrangThai).HasMaxLength(50).IsRequired();

        builder.HasOne(x => x.Hang).WithMany(x => x.DongSanPhams)
            .HasForeignKey(x => x.IdHang).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.DanhMuc).WithMany()
            .HasForeignKey(x => x.IdDanhMuc).OnDelete(DeleteBehavior.Restrict);
    }
}