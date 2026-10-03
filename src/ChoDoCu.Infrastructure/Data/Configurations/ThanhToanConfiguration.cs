using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class ThanhToanConfiguration : IEntityTypeConfiguration<ThanhToan>
{
    public void Configure(EntityTypeBuilder<ThanhToan> builder)
    {
        builder.ToTable("thanhToan");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idThanhToan");
        builder.Property(x => x.TongTien).HasPrecision(18, 2);
        builder.Property(x => x.TrangThai).HasConversion<string>().HasMaxLength(50);

        builder.HasOne(x => x.MuaDichVu).WithMany(x => x.ThanhToans)
            .HasForeignKey(x => x.IdMuaDichVu).OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.PhuongThucTT).WithMany(x => x.ThanhToans)
            .HasForeignKey(x => x.IdPhuongThucTT).OnDelete(DeleteBehavior.Restrict);
    }
}