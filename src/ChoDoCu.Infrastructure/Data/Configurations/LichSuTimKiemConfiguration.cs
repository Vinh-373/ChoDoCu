using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class LichSuTimKiemConfiguration : IEntityTypeConfiguration<LichSuTimKiem>
{
    public void Configure(EntityTypeBuilder<LichSuTimKiem> builder)
    {
        builder.ToTable("lichSuTimKiem");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idLichSu");
        builder.Property(x => x.TuKhoa).HasMaxLength(255).IsRequired();

        builder.HasOne(x => x.NguoiDung).WithMany()
            .HasForeignKey(x => x.IdNguoiDung).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.IdNguoiDung, x.NgayTao });
    }
}
