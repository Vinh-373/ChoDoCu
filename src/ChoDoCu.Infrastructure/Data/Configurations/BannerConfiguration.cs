using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class BannerConfiguration : IEntityTypeConfiguration<Banner>
{
    public void Configure(EntityTypeBuilder<Banner> builder)
    {
        builder.ToTable("banner");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idBanner");
        builder.Property(x => x.HinhAnh).HasMaxLength(500);
        builder.Property(x => x.ViTri).HasMaxLength(100);
        builder.Property(x => x.TrangThai).HasMaxLength(50).IsRequired();
    }
}
