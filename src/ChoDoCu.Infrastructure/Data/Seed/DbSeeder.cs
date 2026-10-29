using ChoDoCu.Domain.Constants;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChoDoCu.Infrastructure.Data.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<NguoiDung>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        await context.Database.MigrateAsync();
        await CapNhatMaTinCuAsync(context);

        // 1. Seed thành phố và phường xã
        // ===== 1. Seed Role + quyền (lưu thành claim trong AspNetRoleClaims) =====
        await SeedPhanQuyenAsync(roleManager);

        // ===== 2. Seed dữ liệu địa lý, danh mục, dịch vụ... =====
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

        await SeedThuocTinhOtoAsync(context);

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

        await context.SaveChangesAsync();

        // ===== 3. Seed Admin =====
        // Nên đặt Seed:AdminEmail / Seed:AdminPassword trong user-secrets hoặc biến môi trường.
        // Giá trị mặc định dưới đây chỉ dành cho môi trường phát triển.
        var adminEmail = (configuration["Seed:AdminEmail"] ?? "admin@chodocu.local").Trim().ToLowerInvariant();
        var adminPassword = configuration["Seed:AdminPassword"] ?? "Admin@123";

        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            adminUser = new NguoiDung
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                HoTen = "Quản trị viên",
                SoDienThoai = "0900000000",
                PhoneNumber = "0900000000",
                GioiTinh = "Khác",
                NgaySinh = new DateTime(1990, 1, 1),
                TrangThai = TrangThaiNguoiDung.HoatDong,
                NgayTao = DateTime.Now
            };

            var result = await userManager.CreateAsync(adminUser, adminPassword);
            if (!result.Succeeded)
                throw new InvalidOperationException(
                    "Không tạo được tài khoản Admin: " + string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        if (!await userManager.IsInRoleAsync(adminUser, AppRoles.Admin))
            await userManager.AddToRoleAsync(adminUser, AppRoles.Admin);
    }

    private static async Task CapNhatMaTinCuAsync(ApplicationDbContext context)
    {
        var idsToFix = (await context.BaiDangs
            .AsNoTracking()
            .Where(x => x.MaTin == "CD00000")
            .Select(x => x.Id)
            .ToListAsync())
            .ToHashSet();

        if (idsToFix.Count == 0)
            return;

        while (true)
        {
            var ids = idsToFix.ToArray();
            if (ids.Any(id => id is <= 0 or > 99_999))
                throw new InvalidOperationException("Không thể tạo mã tin 5 chữ số cho một bài đăng có ID ngoài khoảng 1 đến 99999.");

            var maTinsMucTieu = ids.Select(id => $"CD{id:D5}").ToArray();
            var idBiTrung = await context.BaiDangs
                .AsNoTracking()
                .Where(x => maTinsMucTieu.Contains(x.MaTin))
                .Select(x => x.Id)
                .ToListAsync();

            if (!idBiTrung.Any(idsToFix.Add))
                break;
        }

        await using var transaction = await context.Database.BeginTransactionAsync();
        string? prefixTam = null;
        foreach (var prefix in new[] { "T", "~", "!", "@", "#" })
        {
            var maTinsTam = idsToFix.Select(id => $"{prefix}{id:D5}").ToArray();
            if (!await context.BaiDangs.AsNoTracking().AnyAsync(x => maTinsTam.Contains(x.MaTin)))
            {
                prefixTam = prefix;
                break;
            }
        }

        if (prefixTam is null)
            throw new InvalidOperationException("Không tìm được mã tạm duy nhất để cập nhật mã tin cũ.");

        foreach (var id in idsToFix)
        {
            var maTinTam = $"{prefixTam}{id:D5}";
            var rowsUpdated = await context.BaiDangs
                .Where(x => x.Id == id)
                .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.MaTin, maTinTam));
            if (rowsUpdated != 1)
                throw new InvalidOperationException($"Không thể cập nhật mã tạm cho bài đăng id={id}.");
        }

        foreach (var id in idsToFix)
        {
            var maTin = $"CD{id:D5}";
            var rowsUpdated = await context.BaiDangs
                .Where(x => x.Id == id)
                .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.MaTin, maTin));
            if (rowsUpdated != 1)
                throw new InvalidOperationException($"Không thể cập nhật mã tin cho bài đăng id={id}.");
        }

        await transaction.CommitAsync();
    }

    private static async Task SeedPhanQuyenAsync(RoleManager<IdentityRole<int>> roleManager)
    {
        // Role
        var newlyCreated = new HashSet<string>();
        foreach (var roleName in AppRoles.All)
        {
            if (await roleManager.RoleExistsAsync(roleName)) continue;

            var created = await roleManager.CreateAsync(new IdentityRole<int>(roleName));
            if (!created.Succeeded)
                throw new InvalidOperationException(
                    $"Không tạo được Role {roleName}: " + string.Join("; ", created.Errors.Select(e => e.Description)));
            newlyCreated.Add(roleName);
        }

        // Quyền -> claim của Role.
        //  - Admin: luôn đồng bộ đủ mọi quyền (kể cả quyền mới thêm sau này).
        //  - Role khác: chỉ gán mặc định lần đầu tạo, để không ghi đè phân quyền đã chỉnh trong DB.
        foreach (var (roleName, maQuyen) in AppPermissions.DefaultByRole)
        {
            if (roleName != AppRoles.Admin && !newlyCreated.Contains(roleName)) continue;

            var role = await roleManager.FindByNameAsync(roleName);
            if (role is null) continue;

            var daCo = (await roleManager.GetClaimsAsync(role))
                .Where(c => c.Type == AppPermissions.ClaimType)
                .Select(c => c.Value)
                .ToHashSet();

            foreach (var ma in maQuyen.Where(m => !daCo.Contains(m)))
                await roleManager.AddClaimAsync(role, new Claim(AppPermissions.ClaimType, ma));
        }
    }

    private static async Task SeedThuocTinhOtoAsync(ApplicationDbContext context)
    {
        var xeCo = await context.DanhMucs
            .FirstOrDefaultAsync(x => x.IdDanhMucCha == null && x.TenDanhMuc == "Xe cộ");
        if (xeCo is null)
        {
            xeCo = new DanhMuc { TenDanhMuc = "Xe cộ" };
            context.DanhMucs.Add(xeCo);
            await context.SaveChangesAsync();
        }

        var oto = await context.DanhMucs
            .FirstOrDefaultAsync(x => x.IdDanhMucCha == xeCo.Id && x.TenDanhMuc == "Ô tô");
        if (oto is null)
        {
            oto = new DanhMuc { IdDanhMucCha = xeCo.Id, TenDanhMuc = "Ô tô" };
            context.DanhMucs.Add(oto);
            await context.SaveChangesAsync();
        }

        var hangVaDong = new Dictionary<string, string[]>
        {
            ["Toyota"] = ["Vios", "Corolla Cross", "Camry", "Fortuner"],
            ["Honda"] = ["City", "Civic", "CR-V", "HR-V"],
            ["Hyundai"] = ["Accent", "Creta", "Tucson", "Santa Fe"],
            ["Kia"] = ["Morning", "Seltos", "Sportage", "Carnival"],
            ["Mazda"] = ["Mazda2", "Mazda3", "CX-5", "CX-8"],
            ["VinFast"] = ["VF 3", "VF 5", "VF 6", "VF 8", "VF 9"]
        };

        var tenHangs = hangVaDong.Keys.ToArray();
        var hangsHienCo = await context.Hangs
            .Where(x => tenHangs.Contains(x.TenHang!))
            .ToListAsync();
        var hangTheoTen = hangsHienCo
            .GroupBy(x => x.TenHang!)
            .ToDictionary(x => x.Key, x => x.First());

        foreach (var tenHang in tenHangs.Where(x => !hangTheoTen.ContainsKey(x)))
        {
            var hang = new Hang { TenHang = tenHang };
            context.Hangs.Add(hang);
            hangTheoTen.Add(tenHang, hang);
        }

        await context.SaveChangesAsync();

        var hangIds = hangTheoTen.Values.Select(x => x.Id).ToArray();
        var dongHienCo = await context.DongSanPhams
            .Where(x => x.IdDanhMuc == oto.Id && hangIds.Contains(x.IdHang))
            .ToListAsync();
        foreach (var (tenHang, tenDongs) in hangVaDong)
        {
            var hang = hangTheoTen[tenHang];
            foreach (var tenDong in tenDongs)
            {
                if (dongHienCo.Any(x => x.IdHang == hang.Id && x.TenDongSanPham == tenDong))
                    continue;

                var dong = new DongSanPham
                {
                    TenDongSanPham = tenDong,
                    IdHang = hang.Id,
                    IdDanhMuc = oto.Id
                };
                context.DongSanPhams.Add(dong);
                dongHienCo.Add(dong);
            }
        }

        await context.SaveChangesAsync();

        var thuocTinhsHienCo = await context.ThuocTinhSanPhams
            .Where(x => x.IdDanhMuc == oto.Id)
            .ToListAsync();
        var hangXe = thuocTinhsHienCo.FirstOrDefault(x => x.TenThuocTinh == "Hãng xe");
        if (hangXe is null)
        {
            hangXe = new ThuocTinhSanPham
            {
                IdDanhMuc = oto.Id,
                TenThuocTinh = "Hãng xe",
                KieuDuLieu = KieuDuLieuThuocTinh.LuaChon,
                BatBuoc = true,
                ThuTu = 1
            };
            context.ThuocTinhSanPhams.Add(hangXe);
            thuocTinhsHienCo.Add(hangXe);
        }

        await context.SaveChangesAsync();

        var thuocTinhCon = new (string Ten, KieuDuLieuThuocTinh KieuDuLieu, bool BatBuoc, int ThuTu, List<string> LuaChon)[]
        {
            ("Dòng xe", KieuDuLieuThuocTinh.LuaChon, true, 2, new()),
            ("Năm sản xuất", KieuDuLieuThuocTinh.So, true, 3,
                Enumerable.Range(2000, DateTime.Now.Year - 1999).Select(x => x.ToString()).ToList()),
            ("Số km", KieuDuLieuThuocTinh.So, true, 4, new()),
            ("Hộp số", KieuDuLieuThuocTinh.LuaChon, true, 5, ["Tự động", "Số sàn"]),
            ("Nhiên liệu", KieuDuLieuThuocTinh.LuaChon, true, 6, ["Xăng", "Dầu", "Điện"]),
            ("Số chỗ ngồi", KieuDuLieuThuocTinh.LuaChon, true, 7, ["2", "4", "5", "7", "9", "16"]),
            ("Tình trạng", KieuDuLieuThuocTinh.LuaChon, true, 8, ["Đã sử dụng", "Mới 100%"])
        };

        var dongXe = thuocTinhsHienCo.FirstOrDefault(x => x.TenThuocTinh == "Dòng xe");
        if (dongXe is not null && dongXe.IdThuocTinhCha != hangXe.Id)
            dongXe.IdThuocTinhCha = hangXe.Id;

        foreach (var (ten, kieuDuLieu, batBuoc, thuTu, luaChon) in thuocTinhCon)
        {
            if (thuocTinhsHienCo.Any(x => x.TenThuocTinh == ten))
                continue;

            context.ThuocTinhSanPhams.Add(new ThuocTinhSanPham
            {
                IdDanhMuc = oto.Id,
                IdThuocTinhCha = ten == "Dòng xe" ? hangXe.Id : null,
                TenThuocTinh = ten,
                KieuDuLieu = kieuDuLieu,
                BatBuoc = batBuoc,
                ThuTu = thuTu,
                DanhSachGiaTriLuaChon = luaChon
            });
        }

        await context.SaveChangesAsync();
    }
}
