using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Data.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await context.Database.MigrateAsync();

        if (!await context.ThanhPhos.AnyAsync())
        {
            var hcm = new ThanhPho { TenThanhPho = "Hồ Chí Minh" };
            var hn = new ThanhPho { TenThanhPho = "Hà Nội" };
            context.ThanhPhos.AddRange(hcm, hn);
            await context.SaveChangesAsync();

            context.PhuongXas.AddRange(
                new PhuongXa { IdThanhPho = hcm.Id, TenPhuongXa = "Phường Bến Nghé" },
                new PhuongXa { IdThanhPho = hcm.Id, TenPhuongXa = "Phường Thảo Điền" },
                new PhuongXa { IdThanhPho = hn.Id, TenPhuongXa = "Phường Hoàn Kiếm" });
        }

        if (!await context.DanhMucs.AnyAsync())
        {
            var dienTu = new DanhMuc { TenDanhMuc = "Đồ điện tử" };
            var xeCo = new DanhMuc { TenDanhMuc = "Xe cộ" };
            context.DanhMucs.AddRange(dienTu, xeCo);
            await context.SaveChangesAsync();

            context.DanhMucs.AddRange(
                new DanhMuc { IdDanhMucCha = dienTu.Id, TenDanhMuc = "Điện thoại" },
                new DanhMuc { IdDanhMucCha = dienTu.Id, TenDanhMuc = "Laptop" },
                new DanhMuc { IdDanhMucCha = xeCo.Id, TenDanhMuc = "Xe máy" });
        }

        if (!await context.DichVus.AnyAsync())
        {
            context.DichVus.AddRange(
                new DichVu { TenDichVu = "Đẩy tin 1 lần", Gia = 10000, ThoiGianDichVu = 1, TrangThai = "HoatDong" },
                new DichVu { TenDichVu = "Gói đẩy tin 7 ngày", Gia = 50000, ThoiGianDichVu = 7, TrangThai = "HoatDong" },
                new DichVu { TenDichVu = "Gói tin VIP 30 ngày", Gia = 200000, ThoiGianDichVu = 30, TrangThai = "HoatDong" });
        }

        if (!await context.PhuongThucThanhToans.AnyAsync())
        {
            context.PhuongThucThanhToans.AddRange(
                new PhuongThucThanhToan { TenPhuongThuc = "VNPay" },
                new PhuongThucThanhToan { TenPhuongThuc = "Momo" },
                new PhuongThucThanhToan { TenPhuongThuc = "Chuyển khoản" });
        }

        if (!await context.NguoiDungs.AnyAsync(x => x.Role == VaiTro.Admin))
        {
            context.NguoiDungs.Add(new NguoiDung
            {
                HoTen = "Quản trị viên",
                Email = "admin@chodocu.local",
                SoDienThoai = "0900000000",
                GioiTinh = "Khác",
                NgaySinh = new DateTime(1990, 1, 1),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),   // đổi sau khi chạy lần đầu
                Role = VaiTro.Admin
            });
        }

        await context.SaveChangesAsync();
    }
}