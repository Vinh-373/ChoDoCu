using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;
public class HangConfiguration : IEntityTypeConfiguration<Hang>
{
    public void Configure(EntityTypeBuilder<Hang> builder)
    {
        builder.ToTable("hang");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idHang");
        builder.Property(x => x.TenHang).HasMaxLength(255);
        builder.Property(x => x.Logo).HasMaxLength(500);
        builder.Property(x => x.TrangThai).HasMaxLength(50).IsRequired();
    }
}