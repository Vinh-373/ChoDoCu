using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class HoiThoaiConfiguration : IEntityTypeConfiguration<HoiThoai>
{
    public void Configure(EntityTypeBuilder<HoiThoai> builder)
    {
        builder.ToTable("hoiThoai");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idHoiThoai");

        // Hai FK cùng trỏ về NguoiDung -> phải Restrict cả hai để tránh lỗi "multiple cascade paths"
        builder.HasOne(x => x.NguoiDung1).WithMany()
            .HasForeignKey(x => x.IdNguoiDung1).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.NguoiDung2).WithMany()
            .HasForeignKey(x => x.IdNguoiDung2).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.IdNguoiDung1, x.IdNguoiDung2 }).IsUnique();
    }
}
