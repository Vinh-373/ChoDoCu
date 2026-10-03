using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class NguoiDungConfiguration : IEntityTypeConfiguration<NguoiDung>
{
    public void Configure(EntityTypeBuilder<NguoiDung> builder)
    {
        builder.ToTable("nguoiDung");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idNguoiDung");

        builder.Property(x => x.PasswordHash).HasColumnName("passWord").HasMaxLength(255);
        builder.Property(x => x.UserName).HasMaxLength(255);
        builder.Property(x => x.AnhNguoiDung).HasMaxLength(255);
        builder.Property(x => x.HoTen).HasMaxLength(255).IsRequired();
        builder.Property(x => x.SoDienThoai).HasMaxLength(20).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(255).IsRequired();
        builder.Property(x => x.GioiTinh).HasMaxLength(20).IsRequired();

        // Enum lưu dạng chuỗi (khớp NVARCHAR trong DB)
        // builder.Property(x => x.Role).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.Role).HasColumnName("idRole").HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.TrangThai).HasConversion<string>().HasMaxLength(50);

        builder.HasIndex(x => x.Email).IsUnique();
        builder.HasIndex(x => x.SoDienThoai).IsUnique();
        builder.HasIndex(x => x.UserName).IsUnique().HasFilter("[userName] IS NOT NULL");

        builder.HasOne(x => x.ThanhPho).WithMany()
            .HasForeignKey(x => x.IdThanhPho).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.PhuongXa).WithMany()
            .HasForeignKey(x => x.IdPhuongXa).OnDelete(DeleteBehavior.Restrict);
    }
}
