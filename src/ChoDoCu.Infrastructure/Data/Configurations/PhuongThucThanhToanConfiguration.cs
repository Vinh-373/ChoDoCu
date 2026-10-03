using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;
public class PhuongThucThanhToanConfiguration : IEntityTypeConfiguration<PhuongThucThanhToan>
{
    public void Configure(EntityTypeBuilder<PhuongThucThanhToan> builder)
    {
        builder.ToTable("phuongThucThanhToan");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idPhuongThucTT");
        builder.Property(x => x.TenPhuongThuc).HasMaxLength(100).IsRequired();
        builder.Property(x => x.MoTa).HasMaxLength(500);
        builder.Property(x => x.TrangThai).HasMaxLength(50).IsRequired();
    }
}