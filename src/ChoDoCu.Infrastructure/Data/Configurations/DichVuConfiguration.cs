using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class DichVuConfiguration : IEntityTypeConfiguration<DichVu>
{
    public void Configure(EntityTypeBuilder<DichVu> builder)
    {
        builder.ToTable("dichVu");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idDichVu");
        builder.Property(x => x.TenDichVu).HasMaxLength(255).IsRequired();
        builder.Property(x => x.Gia).HasPrecision(18, 2);
        builder.Property(x => x.TrangThai).HasMaxLength(50).IsRequired();
    }
}
