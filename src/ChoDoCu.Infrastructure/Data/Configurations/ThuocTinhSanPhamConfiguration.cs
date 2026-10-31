using ChoDoCu.Domain.Entities;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class ThuocTinhSanPhamConfiguration : IEntityTypeConfiguration<ThuocTinhSanPham>
{
    public void Configure(EntityTypeBuilder<ThuocTinhSanPham> builder)
    {
        builder.ToTable("thuocTinhSanPham");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idThuocTinh");
        builder.Property(x => x.TenThuocTinh).HasMaxLength(255).IsRequired();
        builder.Property(x => x.KieuDuLieu)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(ChoDoCu.Domain.Enums.KieuDuLieuThuocTinh.Text)
            .IsRequired();
        var giaTriConverter = new ValueConverter<List<string>, string>(
            values => JsonSerializer.Serialize(values, (JsonSerializerOptions?)null),
            json => JsonSerializer.Deserialize<List<string>>(json, (JsonSerializerOptions?)null) ?? new());
        var giaTriComparer = new ValueComparer<List<string>>(
            (left, right) => left!.SequenceEqual(right!),
            values => values.Aggregate(0, (hash, value) => HashCode.Combine(hash, value.GetHashCode())),
            values => values.ToList());
        builder.Property(x => x.DanhSachGiaTriLuaChon)
            .HasConversion(giaTriConverter)
            .HasColumnType("nvarchar(max)")
            .HasDefaultValueSql("'[]'")
            .Metadata.SetValueComparer(giaTriComparer);
        builder.Property(x => x.BatBuoc).HasDefaultValue(false);
        builder.Property(x => x.ThuTu).HasDefaultValue(0);
        builder.Property(x => x.TrangThai).HasMaxLength(50);
        builder.HasIndex(x => x.IdDanhMuc);
        builder.HasOne(x => x.DanhMuc).WithMany()
            .HasForeignKey(x => x.IdDanhMuc).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => x.IdThuocTinhCha);
        builder.HasOne(x => x.ThuocTinhCha).WithMany(x => x.ThuocTinhCons)
            .HasForeignKey(x => x.IdThuocTinhCha).OnDelete(DeleteBehavior.Restrict);
    }
}
