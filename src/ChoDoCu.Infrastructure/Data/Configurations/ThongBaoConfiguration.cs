using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class ThongBaoConfiguration : IEntityTypeConfiguration<ThongBao>
{
    public void Configure(EntityTypeBuilder<ThongBao> builder)
    {
        builder.ToTable("thongBao");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idThongBao");
        builder.Property(x => x.TieuDe).HasMaxLength(255).IsRequired();
        builder.Property(x => x.NoiDung).HasMaxLength(1000);
        builder.Property(x => x.TrangThai).HasMaxLength(50);

        builder.HasOne(x => x.NguoiDung).WithMany(x => x.ThongBaos)
            .HasForeignKey(x => x.IdNguoiDung).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.IdNguoiDung, x.TrangThai });
    }
}
