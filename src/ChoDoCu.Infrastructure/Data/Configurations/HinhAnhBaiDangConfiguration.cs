using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class HinhAnhBaiDangConfiguration : IEntityTypeConfiguration<HinhAnhBaiDang>
{
    public void Configure(EntityTypeBuilder<HinhAnhBaiDang> builder)
    {
        builder.ToTable("hinhAnhBaiDang");
        builder.HasKey(x => new { x.IdBaiDang, x.ThuTu });
        builder.Property(x => x.DuongDan).HasMaxLength(500).IsRequired();
    }
}
