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
        builder.Property(x => x.MaGiaoDichNgoai).HasMaxLength(100);
        builder.Property(x => x.MaGiaoDichCongTT).HasMaxLength(100);
        builder.Property(x => x.MaPhanHoiCongTT).HasMaxLength(50);
        builder.Property(x => x.TongTien).HasPrecision(18, 2);
        builder.Property(x => x.TrangThai).HasConversion<string>().HasMaxLength(50);

        // Mỗi mã đơn ngoài chỉ được gán cho một thanh toán; bản ghi cũ không có mã vẫn được phép.
        builder.HasIndex(x => x.MaGiaoDichNgoai)
            .IsUnique()
            .HasFilter("[maGiaoDichNgoai] IS NOT NULL");

        // Giữ liên kết đến lần mua và phương thức thanh toán, không xóa dây chuyền lịch sử giao dịch.
        builder.HasOne(x => x.MuaDichVu).WithMany(x => x.ThanhToans)
            .HasForeignKey(x => x.IdMuaDichVu).OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.PhuongThucTT).WithMany(x => x.ThanhToans)
            .HasForeignKey(x => x.IdPhuongThucTT).OnDelete(DeleteBehavior.Restrict);
    }
}
