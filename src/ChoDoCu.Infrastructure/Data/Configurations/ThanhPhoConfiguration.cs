using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class ThanhPhoConfiguration : IEntityTypeConfiguration<ThanhPho>
{
    public void Configure(EntityTypeBuilder<ThanhPho> builder)
    {
        builder.ToTable("thanhPho");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idThanhPho");
        builder.Property(x => x.TenThanhPho).HasMaxLength(255).IsRequired();
        builder.HasIndex(x => x.TenThanhPho).IsUnique();
    }
}
