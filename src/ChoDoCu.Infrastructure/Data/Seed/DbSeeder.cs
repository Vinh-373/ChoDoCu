using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Data.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await context.Database.MigrateAsync();

        // 1. Seed thành phố và phường xã
        if (!await context.ThanhPhos.AnyAsync())
        {
            var hcm = new ThanhPho { TenThanhPho = "Hồ Chí Minh" };
            var hn = new ThanhPho { TenThanhPho = "Hà Nội" };

            context.ThanhPhos.AddRange(hcm, hn);
            await context.SaveChangesAsync();

            context.PhuongXas.AddRange(
                new PhuongXa
                {
                    IdThanhPho = hcm.Id,
                    TenPhuongXa = "Phường Bến Nghé"
                },
                new PhuongXa
                {
                    IdThanhPho = hcm.Id,
                    TenPhuongXa = "Phường Thảo Điền"
                },
                new PhuongXa
                {
                    IdThanhPho = hn.Id,
                    TenPhuongXa = "Phường Hoàn Kiếm"
                });

            await context.SaveChangesAsync();
        }

        // 2. Seed danh mục
        if (!await context.DanhMucs.AnyAsync())
        {
            var dienTu = new DanhMuc
            {
                TenDanhMuc = "Đồ điện tử"
            };

            var xeCo = new DanhMuc
            {
                TenDanhMuc = "Xe cộ"
            };

            context.DanhMucs.AddRange(dienTu, xeCo);
            await context.SaveChangesAsync();

            context.DanhMucs.AddRange(
                new DanhMuc
                {
                    IdDanhMucCha = dienTu.Id,
                    TenDanhMuc = "Điện thoại"
                },
                new DanhMuc
                {
                    IdDanhMucCha = dienTu.Id,
                    TenDanhMuc = "Laptop"
                },
                new DanhMuc
                {
                    IdDanhMucCha = xeCo.Id,
                    TenDanhMuc = "Xe máy"
                });

            await context.SaveChangesAsync();
        }

        // 3. Seed hãng
        if (!await context.Hangs.AnyAsync())
        {
            context.Hangs.AddRange(
                new Hang { TenHang = "Apple" },
                new Hang { TenHang = "Samsung" },
                new Hang { TenHang = "Dell" },
                new Hang { TenHang = "Honda" }
            );

            await context.SaveChangesAsync();
        }

        // 4. Seed dòng sản phẩm
        if (!await context.DongSanPhams.AnyAsync())
        {
            var apple = await context.Hangs
                .FirstAsync(x => x.TenHang == "Apple");

            var samsung = await context.Hangs
                .FirstAsync(x => x.TenHang == "Samsung");

            var dell = await context.Hangs
                .FirstAsync(x => x.TenHang == "Dell");

            var honda = await context.Hangs
                .FirstAsync(x => x.TenHang == "Honda");

            var dienThoai = await context.DanhMucs
                .FirstAsync(x => x.TenDanhMuc == "Điện thoại");

            var laptop = await context.DanhMucs
                .FirstAsync(x => x.TenDanhMuc == "Laptop");

            var xeMay = await context.DanhMucs
                .FirstAsync(x => x.TenDanhMuc == "Xe máy");

            context.DongSanPhams.AddRange(
                new DongSanPham
                {
                    TenDongSanPham = "iPhone",
                    IdHang = apple.Id,
                    IdDanhMuc = dienThoai.Id
                },
                new DongSanPham
                {
                    TenDongSanPham = "Galaxy S",
                    IdHang = samsung.Id,
                    IdDanhMuc = dienThoai.Id
                },
                new DongSanPham
                {
                    TenDongSanPham = "Laptop Dell",
                    IdHang = dell.Id,
                    IdDanhMuc = laptop.Id
                },
                new DongSanPham
                {
                    TenDongSanPham = "Xe máy Honda",
                    IdHang = honda.Id,
                    IdDanhMuc = xeMay.Id
                }
            );

            await context.SaveChangesAsync();
        }

        // 5. Seed dòng cụ thể
        if (!await context.DongCuThes.AnyAsync())
        {
            var iphone = await context.DongSanPhams
                .FirstAsync(x => x.TenDongSanPham == "iPhone");

            var galaxy = await context.DongSanPhams
                .FirstAsync(x => x.TenDongSanPham == "Galaxy S");

            var laptopDell = await context.DongSanPhams
                .FirstAsync(x => x.TenDongSanPham == "Laptop Dell");

            var xeHonda = await context.DongSanPhams
                .FirstAsync(x => x.TenDongSanPham == "Xe máy Honda");

            context.DongCuThes.AddRange(
                new DongCuThe
                {
                    TenDongCuThe = "iPhone 15",
                    IdDongSanPham = iphone.Id
                },
                new DongCuThe
                {
                    TenDongCuThe = "Galaxy S24",
                    IdDongSanPham = galaxy.Id
                },
                new DongCuThe
                {
                    TenDongCuThe = "Dell Inspiron",
                    IdDongSanPham = laptopDell.Id
                },
                new DongCuThe
                {
                    TenDongCuThe = "Honda Vision",
                    IdDongSanPham = xeHonda.Id
                }
            );

            await context.SaveChangesAsync();
        }

        // 6. Seed dịch vụ
        if (!await context.DichVus.AnyAsync())
        {
            context.DichVus.AddRange(
                new DichVu
                {
                    TenDichVu = "Đẩy tin 1 lần",
                    Gia = 10000,
                    ThoiGianDichVu = 1,
                    TrangThai = "HoatDong"
                },
                new DichVu
                {
                    TenDichVu = "Gói đẩy tin 7 ngày",
                    Gia = 50000,
                    ThoiGianDichVu = 7,
                    TrangThai = "HoatDong"
                },
                new DichVu
                {
                    TenDichVu = "Gói tin VIP 30 ngày",
                    Gia = 200000,
                    ThoiGianDichVu = 30,
                    TrangThai = "HoatDong"
                }
            );
        }

        // 7. Seed phương thức thanh toán
        if (!await context.PhuongThucThanhToans.AnyAsync())
        {
            context.PhuongThucThanhToans.AddRange(
                new PhuongThucThanhToan
                {
                    TenPhuongThuc = "VNPay"
                },
                new PhuongThucThanhToan
                {
                    TenPhuongThuc = "Momo"
                },
                new PhuongThucThanhToan
                {
                    TenPhuongThuc = "Chuyển khoản"
                }
            );
        }

        // 8. Seed tài khoản Admin
        var admin = await context.Users
            .FirstOrDefaultAsync(
                x => x.Email == "admin@chodocu.local");

        if (admin == null)
        {
            admin = new NguoiDung
            {
                HoTen = "Quản trị viên",
                Email = "admin@chodocu.local",
                UserName = "admin@chodocu.local",
                SoDienThoai = "0900000000",
                PhoneNumber = "0900000000",
                GioiTinh = "Khác",
                NgaySinh = new DateTime(1990, 1, 1),
                Role = VaiTro.Admin
            };

            context.Users.Add(admin);
        }

        admin.Email = "admin@chodocu.local";
        admin.UserName = "admin@chodocu.local";
        admin.NormalizedEmail = "ADMIN@CHODOCU.LOCAL";
        admin.NormalizedUserName = "ADMIN@CHODOCU.LOCAL";

        // Dùng ASP.NET Identity để tạo mật khẩu
        var passwordHasher = new PasswordHasher<NguoiDung>();

        admin.PasswordHash = passwordHasher.HashPassword(
            admin,
            "Admin@123"
        );

        await context.SaveChangesAsync();
    }
}
