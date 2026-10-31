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

        // Banner (HinhAnh là đường dẫn giả lập — thay bằng ảnh thật trong wwwroot/uploads/banners/)
        if (!await context.Set<Banner>().AnyAsync())
        {
            context.Set<Banner>().AddRange(
                new Banner { HinhAnh = "/uploads/banners/banner-trang-chu-1.jpg", ViTri = "TrangChu", TrangThai = "HoatDong" },
                new Banner { HinhAnh = "/uploads/banners/banner-trang-chu-2.jpg", ViTri = "TrangChu", TrangThai = "HoatDong" },
                new Banner { HinhAnh = "/uploads/banners/banner-sidebar.jpg", ViTri = "Sidebar", TrangThai = "HoatDong" });
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

        // ===== 4. Seed dữ liệu demo: sản phẩm, bài đăng, yêu thích, chat, thông báo =====
        // Tắt bằng cách đặt Seed:DemoData = false (nên tắt ở môi trường Production).
        if (!string.Equals(configuration["Seed:DemoData"], "false", StringComparison.OrdinalIgnoreCase))
        {
            await SeedDemoAsync(context, userManager, configuration);
        }
    }

    // =====================================================================
    //  DỮ LIỆU DEMO
    // =====================================================================
    private static async Task SeedDemoAsync(
        ApplicationDbContext context,
        UserManager<NguoiDung> userManager,
        IConfiguration configuration)
    {
        // Đã có bài đăng thì coi như đã seed demo, không làm lại.
        if (await context.Set<BaiDang>().AnyAsync()) return;

        var now = DateTime.Now;
        var demoPassword = configuration["Seed:DemoPassword"] ?? "User@123";

        // ----- Dữ liệu tham chiếu đã seed ở bước 2 -----
        var hcm = await context.ThanhPhos.FirstAsync(x => x.TenThanhPho == "Hồ Chí Minh");
        var hn = await context.ThanhPhos.FirstAsync(x => x.TenThanhPho == "Hà Nội");
        var benNghe = await context.PhuongXas.FirstAsync(x => x.TenPhuongXa == "Phường Bến Nghé");
        var thaoDien = await context.PhuongXas.FirstAsync(x => x.TenPhuongXa == "Phường Thảo Điền");
        var hoanKiem = await context.PhuongXas.FirstAsync(x => x.TenPhuongXa == "Phường Hoàn Kiếm");

        var dmDienThoai = await context.DanhMucs.FirstAsync(x => x.TenDanhMuc == "Điện thoại");
        var dmLaptop = await context.DanhMucs.FirstAsync(x => x.TenDanhMuc == "Laptop");
        var dmXeMay = await context.DanhMucs.FirstAsync(x => x.TenDanhMuc == "Xe máy");

        var dvVip = await context.DichVus.FirstAsync(x => x.TenDichVu == "Gói tin VIP 30 ngày");

        // ----- 4.1 Người dùng demo (role User) -----
        var nguoiBan1 = await TaoNguoiDungAsync(userManager, "nguoiban1@chodocu.local", "Nguyễn Văn An",
            "0911111111", "Nam", new DateTime(1995, 5, 12), hcm.Id, thaoDien.Id, demoPassword);
        var nguoiBan2 = await TaoNguoiDungAsync(userManager, "nguoiban2@chodocu.local", "Trần Thị Bình",
            "0922222222", "Nữ", new DateTime(1993, 9, 20), hn.Id, hoanKiem.Id, demoPassword);
        var nguoiBan3 = await TaoNguoiDungAsync(userManager, "nguoiban3@chodocu.local", "Lê Hoàng Cường",
            "0933333333", "Nam", new DateTime(1990, 3, 8), hcm.Id, benNghe.Id, demoPassword);
        var nguoiMua = await TaoNguoiDungAsync(userManager, "nguoimua@chodocu.local", "Phạm Minh Dũng",
            "0944444444", "Nam", new DateTime(1998, 12, 1), hcm.Id, thaoDien.Id, demoPassword);

        // ----- 4.2 Hãng / Dòng sản phẩm / Dòng cụ thể -----
        var apple = new Hang { TenHang = "Apple" };
        var samsung = new Hang { TenHang = "Samsung" };
        var dell = new Hang { TenHang = "Dell" };
        var honda = new Hang { TenHang = "Honda" };
        context.Set<Hang>().AddRange(apple, samsung, dell, honda);
        await context.SaveChangesAsync();

        var dongIphone = new DongSanPham { TenDongSanPham = "iPhone", IdHang = apple.Id, IdDanhMuc = dmDienThoai.Id };
        var dongGalaxyS = new DongSanPham { TenDongSanPham = "Galaxy S", IdHang = samsung.Id, IdDanhMuc = dmDienThoai.Id };
        var dongXps = new DongSanPham { TenDongSanPham = "XPS", IdHang = dell.Id, IdDanhMuc = dmLaptop.Id };
        var dongVision = new DongSanPham { TenDongSanPham = "Vision", IdHang = honda.Id, IdDanhMuc = dmXeMay.Id };
        var dongWave = new DongSanPham { TenDongSanPham = "Wave", IdHang = honda.Id, IdDanhMuc = dmXeMay.Id };
        context.Set<DongSanPham>().AddRange(dongIphone, dongGalaxyS, dongXps, dongVision, dongWave);
        await context.SaveChangesAsync();

        var ctIphone13 = new DongCuThe { TenDongCuThe = "iPhone 13", IdDongSanPham = dongIphone.Id };
        var ctIphone14Pro = new DongCuThe { TenDongCuThe = "iPhone 14 Pro", IdDongSanPham = dongIphone.Id };
        var ctS22Ultra = new DongCuThe { TenDongCuThe = "Galaxy S22 Ultra", IdDongSanPham = dongGalaxyS.Id };
        var ctXps13 = new DongCuThe { TenDongCuThe = "XPS 13 9310", IdDongSanPham = dongXps.Id };
        var ctVision = new DongCuThe { TenDongCuThe = "Vision 2023", IdDongSanPham = dongVision.Id };
        var ctWaveAlpha = new DongCuThe { TenDongCuThe = "Wave Alpha 110", IdDongSanPham = dongWave.Id };
        context.Set<DongCuThe>().AddRange(ctIphone13, ctIphone14Pro, ctS22Ultra, ctXps13, ctVision, ctWaveAlpha);
        await context.SaveChangesAsync();

        // ----- 4.3 Sản phẩm + Bài đăng + Ảnh -----
        // ChoDoCu: mỗi bài đăng gắn đúng 1 sản phẩm (quan hệ 1-1).
        var baiDangs = new List<BaiDang>
        {
            TaoBaiDang(nguoiBan1.Id, dmDienThoai.Id, apple.Id, dongIphone.Id, ctIphone13.Id,
                tenSp: "iPhone 13 128GB", gia: 11_500_000m,
                moTa: "Máy zin, pin 89%, không trầy xước, đầy đủ hộp và cáp sạc.",
                tieuDe: "Bán iPhone 13 128GB màu xanh, pin 89%",
                noiDung: "Mình đổi máy nên cần bán iPhone 13 128GB. Máy dùng kỹ, face ID/touch hoạt động tốt, bảo hành còn 3 tháng. Có giao lưu nhẹ cho người thiện chí.",
                thanhPho: hcm.Id, phuongXa: thaoDien.Id,
                diaChi: "Phường Thảo Điền, TP. Hồ Chí Minh", diaChiChiTiet: "12 Xuân Thủy",
                ngayDang: now.AddDays(-5), trangThai: TrangThaiBaiDang.DaDuyet,
                anh: new[] { "/uploads/seed/iphone13-1.jpg", "/uploads/seed/iphone13-2.jpg" }),

            TaoBaiDang(nguoiBan1.Id, dmDienThoai.Id, samsung.Id, dongGalaxyS.Id, ctS22Ultra.Id,
                tenSp: "Samsung Galaxy S22 Ultra 256GB", gia: 13_900_000m,
                moTa: "Bản 256GB, kèm bút S-Pen, màn hình không ám, còn bảo hành chính hãng.",
                tieuDe: "Galaxy S22 Ultra 256GB còn bảo hành",
                noiDung: "Máy ít dùng, luôn có ốp và dán cường lực. Camera zoom cực tốt, pin ổn. Bán kèm sạc nhanh 45W.",
                thanhPho: hcm.Id, phuongXa: thaoDien.Id,
                diaChi: "Phường Thảo Điền, TP. Hồ Chí Minh", diaChiChiTiet: "12 Xuân Thủy",
                ngayDang: now.AddDays(-3), trangThai: TrangThaiBaiDang.DaDuyet,
                anh: new[] { "/uploads/seed/s22ultra-1.jpg", "/uploads/seed/s22ultra-2.jpg" }),

            // Bài VIP: có dịch vụ + ưu tiên
            TaoBaiDang(nguoiBan2.Id, dmLaptop.Id, dell.Id, dongXps.Id, ctXps13.Id,
                tenSp: "Dell XPS 13 9310 i7 16GB 512GB", gia: 16_500_000m,
                moTa: "Core i7-1185G7, RAM 16GB, SSD 512GB, màn 13.4 inch FHD+, pin tốt.",
                tieuDe: "Dell XPS 13 9310 i7/16GB/512GB mỏng nhẹ",
                noiDung: "Laptop văn phòng cao cấp, vỏ nhôm nguyên khối, bàn phím êm. Máy đẹp 98%, tặng kèm túi chống sốc.",
                thanhPho: hn.Id, phuongXa: hoanKiem.Id,
                diaChi: "Phường Hoàn Kiếm, Hà Nội", diaChiChiTiet: "45 Hàng Bài",
                ngayDang: now.AddDays(-2), trangThai: TrangThaiBaiDang.DaDuyet,
                idDichVu: dvVip.Id, uuTien: now,
                anh: new[] { "/uploads/seed/xps13-1.jpg", "/uploads/seed/xps13-2.jpg", "/uploads/seed/xps13-3.jpg" }),

            TaoBaiDang(nguoiBan2.Id, dmDienThoai.Id, apple.Id, dongIphone.Id, ctIphone14Pro.Id,
                tenSp: "iPhone 14 Pro 256GB", gia: 20_900_000m,
                moTa: "Màu tím Deep Purple, 256GB, pin 92%, máy lock/quốc tế đã kiểm tra.",
                tieuDe: "iPhone 14 Pro 256GB tím, pin 92%",
                noiDung: "Máy đẹp như mới, chưa sửa chữa. Đổi trả trong 3 ngày nếu lỗi phần cứng.",
                thanhPho: hn.Id, phuongXa: hoanKiem.Id,
                diaChi: "Phường Hoàn Kiếm, Hà Nội", diaChiChiTiet: "45 Hàng Bài",
                ngayDang: now.AddDays(-1), trangThai: TrangThaiBaiDang.DaDuyet,
                anh: new[] { "/uploads/seed/iphone14pro-1.jpg", "/uploads/seed/iphone14pro-2.jpg" }),

            TaoBaiDang(nguoiBan3.Id, dmXeMay.Id, honda.Id, dongVision.Id, ctVision.Id,
                tenSp: "Honda Vision 2023", gia: 28_000_000m,
                moTa: "Xe chạy 6.000km, chính chủ, biển số TP.HCM, giấy tờ đầy đủ.",
                tieuDe: "Honda Vision 2023 chính chủ, đi 6.000km",
                noiDung: "Xe đi ít, bảo dưỡng định kỳ tại hãng. Cho xem xe và thử máy tại nhà.",
                thanhPho: hcm.Id, phuongXa: benNghe.Id,
                diaChi: "Phường Bến Nghé, TP. Hồ Chí Minh", diaChiChiTiet: "88 Lê Lợi",
                ngayDang: now.AddDays(-4), trangThai: TrangThaiBaiDang.DaDuyet,
                anh: new[] { "/uploads/seed/vision-1.jpg", "/uploads/seed/vision-2.jpg" }),

            // Bài đang chờ duyệt — để test chức năng duyệt/từ chối của Admin
            TaoBaiDang(nguoiBan3.Id, dmXeMay.Id, honda.Id, dongWave.Id, ctWaveAlpha.Id,
                tenSp: "Honda Wave Alpha 110", gia: 9_500_000m,
                moTa: "Xe số bền bỉ, tiết kiệm xăng, máy êm, giấy tờ hợp lệ.",
                tieuDe: "Honda Wave Alpha 110 giá rẻ",
                noiDung: "Phù hợp sinh viên đi học, đi làm. Xe đã thay nhớt, lốp mới.",
                thanhPho: hcm.Id, phuongXa: benNghe.Id,
                diaChi: "Phường Bến Nghé, TP. Hồ Chí Minh", diaChiChiTiet: "88 Lê Lợi",
                ngayDang: now.AddHours(-3), trangThai: TrangThaiBaiDang.ChoDuyet,
                anh: new[] { "/uploads/seed/wave-1.jpg" }),
        };

        context.Set<BaiDang>().AddRange(baiDangs);

        // Cập nhật số lượt đăng của người bán (các entity user đang được context theo dõi)
        var nguoiBans = new[] { nguoiBan1, nguoiBan2, nguoiBan3 };
        foreach (var g in baiDangs.GroupBy(b => b.IdNguoiDung))
            nguoiBans.First(u => u.Id == g.Key).LuotDang = g.Count();

        await context.SaveChangesAsync();   // có Id cho từng bài đăng

        var bdIphone13 = baiDangs[0];
        var bdS22 = baiDangs[1];
        var bdXps = baiDangs[2];
        var bdIphone14 = baiDangs[3];
        var bdVision = baiDangs[4];

        // ----- 4.4 Yêu thích -----
        context.Set<YeuThich>().AddRange(
            new YeuThich { IdNguoiDung = nguoiMua.Id, IdBaiDang = bdIphone13.Id, NgayTao = now.AddDays(-4) },
            new YeuThich { IdNguoiDung = nguoiMua.Id, IdBaiDang = bdXps.Id, NgayTao = now.AddDays(-1) },
            new YeuThich { IdNguoiDung = nguoiMua.Id, IdBaiDang = bdVision.Id, NgayTao = now.AddHours(-10) },
            new YeuThich { IdNguoiDung = nguoiBan3.Id, IdBaiDang = bdIphone13.Id, NgayTao = now.AddDays(-2) },
            new YeuThich { IdNguoiDung = nguoiBan1.Id, IdBaiDang = bdIphone14.Id, NgayTao = now.AddHours(-20) });

        // ----- 4.5 Chat: Hội thoại + Tin nhắn -----
        // Quy ước: IdNguoiDung1 < IdNguoiDung2 (dùng HoiThoai.SapXep).
        var (a1, a2) = HoiThoai.SapXep(nguoiMua.Id, nguoiBan1.Id);
        var chat1 = new HoiThoai { IdNguoiDung1 = a1, IdNguoiDung2 = a2, NgayTao = now.AddDays(-4) };
        chat1.TinNhans = new List<TinNhan>
        {
            new() { IdNguoiGui = nguoiMua.Id,  NoiDung = "Chào bạn, iPhone 13 còn không ạ?", DaXem = true, NgayTao = now.AddDays(-4).AddMinutes(0) },
            new() { IdNguoiGui = nguoiBan1.Id, NoiDung = "Chào bạn, máy còn nhé.",              DaXem = true, NgayTao = now.AddDays(-4).AddMinutes(5) },
            new() { IdNguoiGui = nguoiMua.Id,  NoiDung = "Pin còn bao nhiêu % vậy bạn? Có bớt chút nào không?", DaXem = true, NgayTao = now.AddDays(-4).AddMinutes(8) },
            new() { IdNguoiGui = nguoiBan1.Id, NoiDung = "Pin 89%, mình bớt được 300k nếu bạn lấy trong tuần này.", DaXem = true, NgayTao = now.AddDays(-4).AddMinutes(12) },
            new() { IdNguoiGui = nguoiMua.Id,  NoiDung = "Ok, mai mình qua xem máy nhé.",        DaXem = false, NgayTao = now.AddDays(-3) },
        };
        chat1.TinNhanCuoi = chat1.TinNhans.Max(t => t.NgayTao);

        var (b1, b2) = HoiThoai.SapXep(nguoiMua.Id, nguoiBan2.Id);
        var chat2 = new HoiThoai { IdNguoiDung1 = b1, IdNguoiDung2 = b2, NgayTao = now.AddDays(-1) };
        chat2.TinNhans = new List<TinNhan>
        {
            new() { IdNguoiGui = nguoiMua.Id,  NoiDung = "Laptop XPS còn bảo hành không bạn?", DaXem = true,  NgayTao = now.AddDays(-1) },
            new() { IdNguoiGui = nguoiBan2.Id, NoiDung = "Còn bảo hành đến tháng 3 năm sau bạn nhé.", DaXem = false, NgayTao = now.AddDays(-1).AddMinutes(20) },
        };
        chat2.TinNhanCuoi = chat2.TinNhans.Max(t => t.NgayTao);

        context.Set<HoiThoai>().AddRange(chat1, chat2);

        // ----- 4.6 Thông báo -----
        context.Set<ThongBao>().AddRange(
            new ThongBao
            {
                IdNguoiDung = nguoiBan1.Id,
                TieuDe = "Bài đăng đã được duyệt",
                NoiDung = "Bài đăng \"Bán iPhone 13 128GB màu xanh, pin 89%\" đã được duyệt và hiển thị trên trang chủ.",
                NgayTao = now.AddDays(-5), TrangThai = "DaDoc"
            },
            new ThongBao
            {
                IdNguoiDung = nguoiBan1.Id,
                TieuDe = "Tin nhắn mới",
                NoiDung = "Phạm Minh Dũng vừa nhắn tin cho bạn về iPhone 13.",
                NgayTao = now.AddDays(-4), TrangThai = "DaDoc"
            },
            new ThongBao
            {
                IdNguoiDung = nguoiBan1.Id,
                TieuDe = "Có người yêu thích bài đăng",
                NoiDung = "Có người vừa thêm bài đăng \"iPhone 13 128GB\" của bạn vào danh sách yêu thích.",
                NgayTao = now.AddDays(-2), TrangThai = "ChuaDoc"
            },
            new ThongBao
            {
                IdNguoiDung = nguoiBan2.Id,
                TieuDe = "Kích hoạt Gói tin VIP thành công",
                NoiDung = "Bài đăng \"Dell XPS 13 9310\" đã được ưu tiên hiển thị trong 30 ngày.",
                NgayTao = now.AddDays(-2), TrangThai = "DaDoc"
            },
            new ThongBao
            {
                IdNguoiDung = nguoiBan2.Id,
                TieuDe = "Tin nhắn mới",
                NoiDung = "Phạm Minh Dũng vừa hỏi bạn về laptop Dell XPS 13.",
                NgayTao = now.AddDays(-1), TrangThai = "ChuaDoc"
            },
            new ThongBao
            {
                IdNguoiDung = nguoiBan3.Id,
                TieuDe = "Bài đăng đang chờ duyệt",
                NoiDung = "Bài đăng \"Honda Wave Alpha 110 giá rẻ\" đang chờ quản trị viên xét duyệt.",
                NgayTao = now.AddHours(-3), TrangThai = "ChuaDoc"
            },
            new ThongBao
            {
                IdNguoiDung = nguoiMua.Id,
                TieuDe = "Chào mừng đến với ChoDoCu",
                NoiDung = "Tài khoản của bạn đã sẵn sàng. Hãy khám phá hàng nghìn món đồ cũ chất lượng!",
                NgayTao = now.AddDays(-6), TrangThai = "DaDoc"
            },
            new ThongBao
            {
                IdNguoiDung = nguoiMua.Id,
                TieuDe = "Phản hồi từ người bán",
                NoiDung = "Trần Thị Bình đã trả lời tin nhắn của bạn.",
                NgayTao = now.AddDays(-1).AddMinutes(20), TrangThai = "ChuaDoc"
            });

        await context.SaveChangesAsync();
    }

    private static BaiDang TaoBaiDang(
        int idNguoiDung, int idDanhMuc, int idHang, int idDongSanPham, int idDongCuThe,
        string tenSp, decimal gia, string moTa,
        string tieuDe, string noiDung,
        int thanhPho, int? phuongXa, string diaChi, string diaChiChiTiet,
        DateTime ngayDang, TrangThaiBaiDang trangThai,
        string[] anh,
        int? idDichVu = null, DateTime? uuTien = null)
    {
        var baiDang = new BaiDang
        {
            IdNguoiDung = idNguoiDung,
            IdDanhMuc = idDanhMuc,
            IdThanhPho = thanhPho,
            IdPhuongXa = phuongXa,
            IdDichVu = idDichVu,
            TieuDe = tieuDe,
            NoiDung = noiDung,
            DiaChi = diaChi,
            DiaChiChiTiet = diaChiChiTiet,
            NgayDang = ngayDang,
            TrangThai = trangThai,
            UuTien = uuTien,
            // Gán qua navigation để EF tự điền IdSanPham khi lưu
            SanPham = new SanPham
            {
                IdDanhMuc = idDanhMuc,
                IdHang = idHang,
                IdDongSanPham = idDongSanPham,
                IdDongCuThe = idDongCuThe,
                TenSanPham = tenSp,
                GiaTien = gia,
                MoTa = moTa
            }
        };

        foreach (var url in anh)
            baiDang.AnhSanPhams.Add(new AnhSanPham { Url = url });

        return baiDang;
    }

    private static async Task<NguoiDung> TaoNguoiDungAsync(
        UserManager<NguoiDung> userManager,
        string email, string hoTen, string soDienThoai, string gioiTinh, DateTime ngaySinh,
        int idThanhPho, int idPhuongXa, string password)
    {
        email = email.Trim().ToLowerInvariant();
        var user = await userManager.FindByEmailAsync(email);

        if (user == null)
        {
            user = new NguoiDung
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                HoTen = hoTen,
                SoDienThoai = soDienThoai,
                PhoneNumber = soDienThoai,
                GioiTinh = gioiTinh,
                NgaySinh = ngaySinh,
                IdThanhPho = idThanhPho,
                IdPhuongXa = idPhuongXa,
                TrangThai = TrangThaiNguoiDung.HoatDong,
                NgayTao = DateTime.Now
            };

            var result = await userManager.CreateAsync(user, password);
            if (!result.Succeeded)
                throw new InvalidOperationException(
                    $"Không tạo được tài khoản demo {email}: " + string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        if (!await userManager.IsInRoleAsync(user, AppRoles.User))
            await userManager.AddToRoleAsync(user, AppRoles.User);

        return user;
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