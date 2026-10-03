using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class BaoCaoConfiguration : IEntityTypeConfiguration<BaoCao>
{
    public void Configure(EntityTypeBuilder<BaoCao> builder)
    {
        builder.ToTable("baoCao");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idBaoCao");
        builder.Property(x => x.NoiDung).HasMaxLength(1000);
        builder.Property(x => x.TrangThai).HasMaxLength(50);

        builder.HasOne(x => x.NguoiDung).WithMany()
            .HasForeignKey(x => x.IdNguoiDung).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.BaiDang).WithMany()
            .HasForeignKey(x => x.IdBaiDang).OnDelete(DeleteBehavior.Cascade);
    }
}
