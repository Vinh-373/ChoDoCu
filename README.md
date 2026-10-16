# Chợ Đồ Cũ (ChoDoCu)

API cho sàn mua bán đồ cũ: đăng bài, danh mục, tìm kiếm, yêu thích, chat, thông báo, thanh toán dịch vụ đẩy tin, báo cáo vi phạm. Đăng nhập và phân quyền dùng ASP.NET Core Identity.

## Mục lục

1. [Công nghệ](#1-công-nghệ)
2. [Yêu cầu cài đặt](#2-yêu-cầu-cài-đặt)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Cài đặt và chạy lần đầu](#4-cài-đặt-và-chạy-lần-đầu)
5. [Cấu hình](#5-cấu-hình)
6. [Cơ sở dữ liệu và migration](#6-cơ-sở-dữ-liệu-và-migration)
7. [Đăng nhập và phân quyền](#7-đăng-nhập-và-phân-quyền)
8. [Các API tài khoản](#8-các-api-tài-khoản)
9. [Cấu hình gửi email](#9-cấu-hình-gửi-email)
10. [Chạy test](#10-chạy-test)
11. [Xử lý lỗi thường gặp](#11-xử-lý-lỗi-thường-gặp)
12. [Quy ước làm việc với git](#12-quy-ước-làm-việc-với-git)

---

## 1. Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Nền tảng | .NET 10, ASP.NET Core Web API |
| Cơ sở dữ liệu | SQL Server, Entity Framework Core |
| Đăng nhập, phân quyền | ASP.NET Core Identity (`IdentityUser<int>`), JWT Bearer |
| Kiểm tra dữ liệu đầu vào | FluentValidation |
| Tài liệu API | Swagger (Swashbuckle) |
| Kiến trúc | Domain, Application, Infrastructure, API (tách lớp, Unit of Work) |

## 2. Yêu cầu cài đặt

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- SQL Server (bản LocalDB đi kèm Visual Studio, SQL Server Express hoặc Docker đều được)
- Công cụ EF Core:
  ```powershell
  dotnet tool install --global dotnet-ef
  ```
  Nếu đã cài, cập nhật bằng `dotnet tool update --global dotnet-ef`.
- Git
- (Khuyến nghị) Visual Studio 2022 trở lên hoặc VS Code kèm C# Dev Kit

Kiểm tra nhanh:
```powershell
dotnet --version     # phải là 10.x
dotnet ef --version
```

## 3. Cấu trúc thư mục

```
ChoDoCu/
├─ src/
│  ├─ ChoDoCu.Domain/           Entity, enum, hằng số (AppRoles, AppPermissions), interface repository
│  ├─ ChoDoCu.Application/      Nghiệp vụ: service, DTO, validator, interface dịch vụ ngoài
│  ├─ ChoDoCu.Infrastructure/   EF Core, Identity, repository, JWT, gửi email, seeder, migration
│  └─ ChoDoCu.API/              Controller, Program.cs, Extensions, Authorization, Middlewares
└─ tests/
   ├─ ChoDoCu.UnitTests/
   └─ ChoDoCu.IntegrationTests/
```

Chiều phụ thuộc: `API` → `Infrastructure` → `Application` → `Domain`. Domain không phụ thuộc lớp nào khác.

Trong `ChoDoCu.API`:

| Thư mục | Vai trò |
|---|---|
| `Controllers/` | Các endpoint |
| `Extensions/` | Cấu hình dịch vụ: `JwtExtensions` (xác thực), `PermissionAuthorizationExtensions` (phân quyền), `SwaggerExtensions`, `CorsExtensions` |
| `Authorization/` | Attribute `[HasPermission]` và bộ kiểm tra quyền |
| `Middlewares/` | Xử lý lỗi tập trung |

## 4. Cài đặt và chạy lần đầu

```powershell
# 1. Lấy code
git clone <địa-chỉ-repo>
cd ChoDoCu

# 2. Khôi phục package và build
dotnet restore
dotnet build

# 3. Kiểm tra chuỗi kết nối DB (xem mục 5), sửa nếu máy bạn khác mặc định

# 4. Chạy API
cd src\ChoDoCu.API
dotnet run
```

Khi chạy ở môi trường **Development**, API tự làm các việc sau lúc khởi động (trong `DbSeeder`):

1. Tạo database và áp dụng toàn bộ migration.
2. Tạo 3 Role: `Admin`, `Moderator`, `User`.
3. Gán quyền mặc định cho từng Role (lưu trong bảng `AspNetRoleClaims`).
4. Thêm dữ liệu mẫu: thành phố, phường/xã, danh mục, dịch vụ, phương thức thanh toán.
5. Tạo tài khoản Admin.

Mở Swagger tại `http://localhost:5059/swagger` (cổng có thể khác, xem dòng `Now listening on:` trong cửa sổ chạy hoặc `Properties/launchSettings.json`).

Tài khoản Admin mặc định (chỉ dùng cho dev):

| Email | Mật khẩu |
|---|---|
| `admin@chodocu.local` | `Admin@123` |

Cách gọi API có yêu cầu đăng nhập trên Swagger: gọi `POST /api/auth/dang-nhap`, copy giá trị `token`, bấm nút **Authorize** ở góc trên và dán token vào (không cần gõ chữ `Bearer`).

## 5. Cấu hình

Cấu hình đọc theo thứ tự, mục sau ghi đè mục trước:
`appsettings.json` → `appsettings.Development.json` → **user-secrets** (chỉ Development) → **biến môi trường**.

### Nguyên tắc

- Giá trị **không bí mật** để trong `appsettings.json` và được commit, để ai pull về cũng chạy được.
- Giá trị **bí mật hoặc riêng từng máy** (mật khẩu email, chuỗi kết nối riêng) đặt bằng user-secrets. Thư mục user-secrets nằm ngoài dự án nên không bị đẩy lên git.

### Các mục cấu hình

| Khóa | Ý nghĩa | Ghi chú |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | Chuỗi kết nối SQL Server | Mỗi máy có thể khác nhau |
| `Jwt:Key` | Khóa ký token | **Tối thiểu 32 ký tự**, ngắn hơn API báo lỗi lúc khởi động |
| `Jwt:Issuer`, `Jwt:Audience` | Nơi phát hành, đối tượng nhận token | Phải khớp giữa lúc tạo và lúc kiểm tra |
| `Jwt:ExpireMinutes` | Thời hạn token (phút) | Mặc định 120 |
| `Seed:AdminEmail`, `Seed:AdminPassword` | Tài khoản Admin tạo lúc seed | Mặc định `admin@chodocu.local` / `Admin@123` |
| `Email:*` | Gửi email (xem mục 9) | Để trống `Host` là chế độ chỉ ghi log |
| `Cors:Origins` | Danh sách địa chỉ frontend được phép gọi | Không khai báo thì dùng `http://localhost:3000`, `http://localhost:5173` |

Ví dụ `appsettings.json` đầy đủ cho môi trường dev:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=ChoDoCu;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "khoa-chi-dung-cho-dev-it-nhat-32-ky-tu-123456",
    "Issuer": "ChoDoCu",
    "Audience": "ChoDoCu.Client",
    "ExpireMinutes": 120
  },
  "Seed": {
    "AdminEmail": "admin@chodocu.local",
    "AdminPassword": "Admin@123"
  },
  "Email": {
    "Host": "",
    "Port": 587,
    "EnableSsl": true,
    "FromName": "Chợ Đồ Cũ",
    "ResetPasswordUrl": "http://localhost:3000/dat-lai-mat-khau",
    "ResetTokenHours": 1
  }
}
```

### Ghi đè trên máy của bạn bằng user-secrets

```powershell
cd src\ChoDoCu.API
dotnet user-secrets init          # chỉ cần chạy 1 lần
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=.;Database=ChoDoCu;User Id=sa;Password=<mật-khẩu>;TrustServerCertificate=True"
dotnet user-secrets list          # xem lại các giá trị đã đặt
```

### Môi trường thật (Production)

Dùng biến môi trường, hai dấu gạch dưới thay cho dấu `:`:

```
Jwt__Key=<khóa mạnh, khác khóa dev>
ConnectionStrings__DefaultConnection=<chuỗi kết nối thật>
Seed__AdminPassword=<mật khẩu Admin mạnh>
Email__Host=smtp.gmail.com
Email__UserName=...
Email__FromAddress=...
Email__Password=...
```

Lưu ý: việc tự migrate và seed chỉ chạy khi `ASPNETCORE_ENVIRONMENT=Development`. Ở Production phải áp migration thủ công (mục 6) và chạy seed một lần, nếu không DB không có Role `User` và đăng ký tài khoản sẽ báo lỗi.

## 6. Cơ sở dữ liệu và migration

Lệnh `dotnet ef` luôn chạy ở thư mục gốc của solution, trỏ `-p` vào project chứa `DbContext` và `-s` vào project khởi động:

```powershell
# Tạo migration mới sau khi sửa entity hoặc configuration
dotnet ef migrations add TenMigration -p src\ChoDoCu.Infrastructure -s src\ChoDoCu.API

# Áp migration vào DB (Development thì API tự làm lúc khởi động)
dotnet ef database update -p src\ChoDoCu.Infrastructure -s src\ChoDoCu.API

# Xóa migration cuối cùng (khi chưa áp vào DB)
dotnet ef migrations remove -p src\ChoDoCu.Infrastructure -s src\ChoDoCu.API

# Xóa toàn bộ DB để làm lại từ đầu (MẤT HẾT DỮ LIỆU)
dotnet ef database drop -f -p src\ChoDoCu.Infrastructure -s src\ChoDoCu.API
```

Quy ước:
- Thư mục `Migrations` **phải được commit**, để mọi người cùng có một lược đồ DB.
- Sau khi pull code có migration mới, chỉ cần chạy lại API (hoặc `dotnet ef database update`).
- Tên cột và bảng theo kiểu camelCase (`hoTen`, `idNguoiDung`), tên bảng nghiệp vụ cũng camelCase (`baiDang`, `thongBao`). Các bảng của Identity giữ tên mặc định (`AspNetUsers`, `AspNetRoles`, `AspNetUserRoles`, `AspNetRoleClaims`, `AspNetUserClaims`...) nhưng cột vẫn theo camelCase.
- Không tự thêm bảng riêng cho vai trò hay quyền. Dùng các bảng của Identity (mục 7).

## 7. Đăng nhập và phân quyền

### Mô hình lưu trữ (chỉ dùng bảng có sẵn của Identity)

| Dữ liệu | Bảng |
|---|---|
| Người dùng | `AspNetUsers` (`NguoiDung : IdentityUser<int>`) |
| Vai trò | `AspNetRoles` (`IdentityRole<int>`) |
| Người dùng thuộc vai trò nào | `AspNetUserRoles` |
| Quyền chi tiết của vai trò | `AspNetRoleClaims` (`claimType = "permission"`, `claimValue` = mã quyền) |
| Quyền cấp riêng cho một người (nếu cần) | `AspNetUserClaims` |

### Cách hoạt động

1. Người dùng đăng nhập, API lấy các Role của họ, gộp các quyền của những Role đó (và quyền cấp riêng nếu có), rồi đưa vào JWT dưới dạng claim `role` và claim `permission`.
2. Controller dùng `[HasPermission(...)]` hoặc `[Authorize(Roles = ...)]` để chặn.

Chú ý: quyền nằm trong token, nên khi đổi quyền hoặc khóa tài khoản, token đã cấp vẫn dùng được đến khi hết hạn (`Jwt:ExpireMinutes`). Người dùng đăng nhập lại sẽ nhận quyền mới.

### Role và quyền mặc định

Định nghĩa trong `src/ChoDoCu.Domain/Constants/AppPermissions.cs`.

| Quyền | Admin | Moderator | User |
|---|:-:|:-:|:-:|
| `BaiDang.Tao` (đăng bài) | ✔ | ✔ | ✔ |
| `BaiDang.Duyet` (duyệt, từ chối bài, xem bài chưa duyệt) | ✔ | ✔ | |
| `BaiDang.XoaBatKy` | ✔ | ✔ | |
| `BaoCao.XuLy` | ✔ | ✔ | |
| `NguoiDung.Xem` (danh sách người dùng) | ✔ | ✔ | |
| `NguoiDung.Khoa` (khóa, mở khóa) | ✔ | | |
| `DanhMuc.QuanLy` | ✔ | | |
| `Banner.QuanLy` | ✔ | | |
| `DichVu.QuanLy` | ✔ | | |
| `ThanhToan.XacNhan` | ✔ | | |
| `PhanQuyen.QuanLy` | ✔ | | |

Tài khoản tự đăng ký luôn mang Role `User`. Admin và Moderator chỉ được cấp bởi quản trị viên.

### Thêm một quyền mới

1. Trong `AppPermissions.cs`: khai báo hằng số, thêm vào danh sách `All`, và thêm vào `DefaultByRole` của Role cần có.
2. Gắn vào endpoint: `[HasPermission(AppPermissions.TenQuyenMoi)]`.
3. Chạy lại API. Quyền mới tự được thêm cho `Admin`. Với Role đã tồn tại khác, bổ sung bằng SQL hoặc `RoleManager.AddClaimAsync`, vì seeder chỉ gán mặc định lúc Role mới được tạo:
   ```sql
   INSERT INTO AspNetRoleClaims (roleId, claimType, claimValue)
   SELECT id, 'permission', 'TenQuyenMoi' FROM AspNetRoles WHERE name = 'Moderator'
   ```

### Ví dụ trong controller

```csharp
[HasPermission(AppPermissions.BaiDangDuyet)]   // theo quyền chi tiết (khuyên dùng)
[HttpPut("{id:int}/duyet")]
public async Task<IActionResult> Duyet(int id) { ... }

[Authorize(Roles = AppRoles.Admin)]            // theo vai trò
[Authorize]                                    // chỉ cần đăng nhập
```

## 8. Các API tài khoản

| Method | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/auth/dang-ky` | công khai | Đăng ký (họ tên, email, SĐT, mật khẩu, ngày sinh, giới tính) |
| POST | `/api/auth/dang-nhap` | công khai | Đăng nhập, trả token, roles, permissions |
| POST | `/api/auth/doi-mat-khau` | đăng nhập | Đổi mật khẩu (`matKhauCu`, `matKhauMoi`) |
| POST | `/api/auth/quen-mat-khau` | công khai | Gửi email chứa liên kết đặt lại mật khẩu |
| POST | `/api/auth/dat-lai-mat-khau` | công khai | Đặt lại mật khẩu (`email`, `token`, `matKhauMoi`) |
| GET | `/api/nguoi-dung/me` | đăng nhập | Xem hồ sơ cá nhân |
| PUT | `/api/nguoi-dung/me` | đăng nhập | Sửa hồ sơ (họ tên, SĐT, ngày sinh, giới tính, địa chỉ, avatar) |
| GET | `/api/nguoi-dung` | `NguoiDung.Xem` | Danh sách người dùng, phân trang, lọc |
| PUT | `/api/nguoi-dung/{id}/khoa` | `NguoiDung.Khoa` | Khóa tài khoản |
| PUT | `/api/nguoi-dung/{id}/mo-khoa` | `NguoiDung.Khoa` | Mở khóa tài khoản |

Các nhóm API nghiệp vụ khác: `/api/bai-dang`, `/api/danh-muc`, `/api/dia-chi`, `/api/banner`, `/api/bao-cao`, `/api/dich-vu`, `/api/thanh-toan`, `/api/thong-bao`, `/api/tim-kiem`, `/api/tin-nhan`, `/api/yeu-thich`. Xem chi tiết trên Swagger.

### Quy tắc mật khẩu
Tối thiểu 6 ký tự, có ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số. Quy tắc này khai báo ở hai nơi phải luôn khớp nhau: `Common/Validation/MatKhauRules.cs` (Application) và phần cấu hình Identity trong `Infrastructure/DependencyInjection.cs`.

### Đăng nhập sai nhiều lần
Sai mật khẩu 5 lần liên tiếp thì tài khoản bị khóa tạm 5 phút. Cấu hình trong `Infrastructure/DependencyInjection.cs` (`Lockout`). Đây là khóa tự động, khác với khóa do Admin (`TrangThai = Khoa`).

### Lọc danh sách người dùng
```
GET /api/nguoi-dung?keyword=an&trangThai=Khoa&role=User&page=1&pageSize=20
```
- `keyword`: tìm theo họ tên, email, số điện thoại.
- `trangThai`: `HoatDong` hoặc `Khoa`.
- `role`: tên Role, ví dụ `Admin`, `Moderator`, `User`.
- `pageSize` tối đa 100. Kết quả mới nhất trước.

### Quên và đặt lại mật khẩu
1. Frontend gọi `POST /api/auth/quen-mat-khau` với `{ "email": "..." }`. API luôn trả 200 với cùng một câu dù email có tồn tại hay không.
2. Nếu tài khoản tồn tại, người dùng nhận email chứa liên kết dạng `<ResetPasswordUrl>?email=...&token=...`.
3. Trang đặt lại mật khẩu của frontend đọc `email` và `token` từ URL (đã giải mã), cho người dùng nhập mật khẩu mới rồi gọi `POST /api/auth/dat-lai-mat-khau` với `{ "email", "token", "matKhauMoi" }`.
4. Liên kết hết hạn sau `Email:ResetTokenHours` giờ (mặc định 1) và chỉ dùng được một lần.

## 9. Cấu hình gửi email

Mặc định `Email:Host` để trống: API **không gửi thật**, chỉ ghi liên kết ra log, ví dụ:

```
warn: ...SmtpEmailService
      Email:Host chưa cấu hình, không gửi thật. Gửi tới a@gmail.com: http://localhost:3000/dat-lai-mat-khau?email=...&token=...
```

Cách này đủ để thử luồng đặt lại mật khẩu mà không cần email thật: lấy giá trị `token`, giải mã URL (`%2F` thành `/`, `%3D` thành `=`, `%2B` thành `+`), rồi gọi `dat-lai-mat-khau` trên Swagger.

### Gửi email thật bằng Gmail

1. Bật **xác minh 2 bước** cho tài khoản Gmail dùng để gửi.
2. Vào mục **Mật khẩu ứng dụng** của tài khoản Google, tạo mật khẩu 16 ký tự. Gmail không chấp nhận mật khẩu đăng nhập thường.
3. Đặt cấu hình trên máy bạn:
   ```powershell
   cd src\ChoDoCu.API
   dotnet user-secrets set "Email:Host" "smtp.gmail.com"
   dotnet user-secrets set "Email:UserName" "email-gui@gmail.com"
   dotnet user-secrets set "Email:FromAddress" "email-gui@gmail.com"
   dotnet user-secrets set "Email:Password" "<mật khẩu ứng dụng>"
   ```
4. Chạy lại API và gọi `quen-mat-khau`. Lần đầu thư có thể vào mục Spam.

Nếu SMTP lỗi, API vẫn trả 200 (để không lộ email nào đã đăng ký) và chỉ ghi lỗi vào log mức Error: `Không gửi được email đặt lại mật khẩu cho người dùng ...`.

## 10. Chạy test

```powershell
dotnet test
```

Hoặc chạy riêng:
```powershell
dotnet test tests\ChoDoCu.UnitTests
dotnet test tests\ChoDoCu.IntegrationTests
```

## 11. Xử lý lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| `'IdentityBuilder' does not contain a definition for 'AddDefaultTokenProviders'` | Infrastructure là class library, thiếu tham chiếu thư viện ASP.NET Core | Trong `ChoDoCu.Infrastructure.csproj` thêm `<ItemGroup><FrameworkReference Include="Microsoft.AspNetCore.App" /></ItemGroup>` |
| `Unable to resolve service for type 'IValidator<...>'` | Thiếu class validator hoặc file bị xóa/ghi đè | Kiểm tra thư mục `Application/Features/.../Validators` có đủ validator tương ứng với request |
| `Unable to resolve service for type 'IEmailService'` | Chưa đăng ký `IEmailService` | Trong `Infrastructure/DependencyInjection.cs` thêm `services.AddScoped<IEmailService, SmtpEmailService>();` và đăng ký `EmailSettings` |
| `'AppPermissions' does not contain a definition for '...'` | Domain thiếu quyền mà controller dùng | Cập nhật `Domain/Constants/AppPermissions.cs` mới nhất |
| `'IServiceCollection' does not contain a definition for 'AddPermissionAuthorization'` | Thiếu `Extensions/PermissionAuthorizationExtensions.cs` | Thêm file này vào project API |
| `Cannot insert the value NULL into column 'moTa', table 'AspNetRoles'` | DB còn cấu trúc cũ so với model | Xóa DB dev (`dotnet ef database drop -f ...`), tạo migration mới rồi chạy lại |
| `No migrations were found in assembly 'ChoDoCu.Infrastructure'` | Chưa có migration | `dotnet ef migrations add InitialCreate -p src\ChoDoCu.Infrastructure -s src\ChoDoCu.API` |
| Gọi `quen-mat-khau` trả 200 nhưng không có thư | Chưa cấu hình `Email`, email không có trong DB, hoặc SMTP lỗi | Xem log `dotnet run` ngay sau khi gọi (mục 9). Kiểm tra `SELECT email, trangThai FROM AspNetUsers` |
| Dùng `user-secrets` báo thiếu `UserSecretsId` | Chưa khởi tạo | `dotnet user-secrets init` trong thư mục `src\ChoDoCu.API` |
| `Jwt:Key phải dài ít nhất 32 ký tự` | Khóa quá ngắn hoặc thiếu | Đặt `Jwt:Key` dài hơn |
| 401 dù đã dán token | Hết hạn, sai `Issuer`/`Audience`/`Key`, hoặc dán nhầm chữ `Bearer` | Đăng nhập lại; Swagger chỉ cần dán nguyên token |
| 403 | Đã đăng nhập nhưng thiếu quyền | Xem token có claim `permission` cần thiết không (dùng jwt.io), đăng nhập lại sau khi đổi quyền |
| Cảnh báo `NU1903` về `Microsoft.OpenApi` | Package có lỗ hổng đã công bố | Cập nhật: `dotnet add src\ChoDoCu.API package Microsoft.OpenApi` (làm tương tự cho `IntegrationTests`) |
| Cảnh báo `NU1510` về `Microsoft.Extensions.Options.ConfigurationExtensions` | Package thừa | Xóa dòng `PackageReference` đó trong `ChoDoCu.Infrastructure.csproj` |

## 12. Quy ước làm việc với git

- **Không commit** mật khẩu thật, `Jwt:Key` của môi trường thật, hay thư mục `bin/`, `obj/`. Nếu lỡ commit bí mật, hãy đổi giá trị đó ngay (xóa dòng trong file là chưa đủ vì git giữ lịch sử).
- **Phải commit** thư mục `Migrations`, và `appsettings.json` (chỉ chứa giá trị dev không bí mật).
- Sau khi `git pull`: chạy `dotnet restore`, `dotnet build`, rồi chạy API để migration mới tự được áp dụng (Development).
- Khi đổi entity: tạo migration, kiểm tra file migration sinh ra có đúng ý rồi mới commit.
- Khi thêm endpoint cần phân quyền: thêm quyền vào `AppPermissions` (mục 7) thay vì viết cứng tên Role.
