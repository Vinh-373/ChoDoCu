using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class MuaDichVuConfiguration : IEntityTypeConfiguration<MuaDichVu>
{
    public void Configure(EntityTypeBuilder<MuaDichVu> builder)
    {
        builder.ToTable("muaDichVu");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idMuaDichVu");
        builder.Property(x => x.TrangThai).HasConversion<string>().HasMaxLength(50);

        builder.HasOne(x => x.DichVu).WithMany()
            .HasForeignKey(x => x.IdDichVu).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.NguoiDung).WithMany(x => x.MuaDichVus)
            .HasForeignKey(x => x.IdNguoiDung).OnDelete(DeleteBehavior.Restrict);
    }
}
