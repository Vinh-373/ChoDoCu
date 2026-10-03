using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class ThuocTinhSanPhamConfiguration : IEntityTypeConfiguration<ThuocTinhSanPham>
{
    public void Configure(EntityTypeBuilder<ThuocTinhSanPham> builder)
    {
        builder.ToTable("thuocTinhSanPham");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idThuocTinh");
        builder.Property(x => x.TenThuocTinh).HasMaxLength(255).IsRequired();
        builder.Property(x => x.TrangThai).HasMaxLength(50);
    }
}
