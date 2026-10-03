using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class TinNhanConfiguration : IEntityTypeConfiguration<TinNhan>
{
    public void Configure(EntityTypeBuilder<TinNhan> builder)
    {
        builder.ToTable("tinNhan");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idTinNhan");
        builder.Property(x => x.NoiDung).HasMaxLength(2000).IsRequired();

        builder.HasOne(x => x.HoiThoai).WithMany(x => x.TinNhans)
            .HasForeignKey(x => x.IdHoiThoai).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.NguoiGui).WithMany()
            .HasForeignKey(x => x.IdNguoiGui).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.IdHoiThoai, x.NgayTao });
    }
}
