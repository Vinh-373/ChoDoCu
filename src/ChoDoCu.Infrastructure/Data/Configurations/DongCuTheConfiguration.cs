using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;
public class DongCuTheConfiguration : IEntityTypeConfiguration<DongCuThe>
{
    public void Configure(EntityTypeBuilder<DongCuThe> builder)
    {
        builder.ToTable("dongCuThe");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idDongCuThe");
        builder.Property(x => x.TenDongCuThe).HasMaxLength(255);
        builder.Property(x => x.TrangThai).HasMaxLength(50).IsRequired();

        builder.HasOne(x => x.DongSanPham).WithMany(x => x.DongCuThes)
            .HasForeignKey(x => x.IdDongSanPham).OnDelete(DeleteBehavior.Restrict);
    }
}