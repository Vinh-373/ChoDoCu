using ChoDoCu.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChoDoCu.Infrastructure.Data.Configurations;

public class PhuongXaConfiguration : IEntityTypeConfiguration<PhuongXa>
{
    public void Configure(EntityTypeBuilder<PhuongXa> builder)
    {
        builder.ToTable("phuongXa");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("idPhuongXa");
        builder.Property(x => x.TenPhuongXa).HasMaxLength(255).IsRequired();

        builder.HasOne(x => x.ThanhPho).WithMany(x => x.PhuongXas)
            .HasForeignKey(x => x.IdThanhPho).OnDelete(DeleteBehavior.Restrict);
    }
}
