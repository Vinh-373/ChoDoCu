using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class SanPhamThuocTinhConfiguration : IEntityTypeConfiguration<SanPhamThuocTinh>
{
    public void Configure(EntityTypeBuilder<SanPhamThuocTinh> builder)
    {
        builder.ToTable("sanPham_thuocTinh");
        builder.HasKey(x => new { x.IdSanPham, x.IdThuocTinh });   // khóa chính ghép
        builder.Property(x => x.GiaTri).HasMaxLength(255);

        builder.HasOne(x => x.SanPham).WithMany()
            .HasForeignKey(x => x.IdSanPham).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.ThuocTinh).WithMany(x => x.SanPhamThuocTinhs)
            .HasForeignKey(x => x.IdThuocTinh).OnDelete(DeleteBehavior.Restrict);
    }
}
