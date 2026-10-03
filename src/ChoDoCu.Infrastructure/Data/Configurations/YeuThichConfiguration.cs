using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class YeuThichConfiguration : IEntityTypeConfiguration<YeuThich>
{
    public void Configure(EntityTypeBuilder<YeuThich> builder)
    {
        builder.ToTable("yeuThich");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idYeuThich");

        builder.HasOne(x => x.NguoiDung).WithMany(x => x.YeuThichs)
            .HasForeignKey(x => x.IdNguoiDung).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.BaiDang).WithMany()
            .HasForeignKey(x => x.IdBaiDang).OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.IdNguoiDung, x.IdBaiDang }).IsUnique();   // 1 người chỉ thích 1 bài 1 lần
    }
}
