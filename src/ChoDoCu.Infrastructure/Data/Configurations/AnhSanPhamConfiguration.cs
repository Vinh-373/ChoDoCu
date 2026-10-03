using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class AnhSanPhamConfiguration : IEntityTypeConfiguration<AnhSanPham>
{
    public void Configure(EntityTypeBuilder<AnhSanPham> builder)
    {
        builder.ToTable("anhSanPham");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idAnhSanPham");
        builder.Property(x => x.Url).HasMaxLength(500).IsRequired();
        // Quan hệ với BaiDang (cascade) được khai báo bên BaiDangConfiguration
    }
}
