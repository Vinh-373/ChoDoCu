using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class DanhMucConfiguration : IEntityTypeConfiguration<DanhMuc>
{
    public void Configure(EntityTypeBuilder<DanhMuc> builder)
    {
        builder.ToTable("danhMuc");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idDanhMuc");

        builder.Property(x => x.TenDanhMuc).HasMaxLength(255).IsRequired();
        builder.Property(x => x.AnhDanhMuc).HasMaxLength(255);
        builder.Property(x => x.TrangThai).HasMaxLength(50).IsRequired();

        // Quan hệ cha - con (tự tham chiếu)
        builder.HasOne(x => x.DanhMucCha).WithMany(x => x.DanhMucCons)
            .HasForeignKey(x => x.IdDanhMucCha).OnDelete(DeleteBehavior.Restrict);
    }
}
