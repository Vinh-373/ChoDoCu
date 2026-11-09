# Quy ước dự án ChoDoCu (.NET 10)
- Kiến trúc: API → Infrastructure → Application → Domain. Dùng Unit of Work + repository (interface ở Domain).
- Controller mỏng. Nghiệp vụ ở Application/Features/<Tên>/Services, DTO ở Dtos, kiểm tra đầu vào bằng FluentValidation (Validators).
- Tên bảng, cột theo tiếng Việt không dấu, camelCase (baiDang, idNguoiDung). Route kebab-case (/api/bai-dang).
- Phân quyền bằng [HasPermission(AppPermissions.X)] hoặc [Authorize]. Không tạo bảng vai trò/quyền riêng.
- Xử lý lỗi theo đúng kiểu exception/Result đang dùng trong code có sẵn (middleware tập trung).
- Trước khi viết, đọc file tương tự đã có (ví dụ DanhMuc, YeuThich) và theo đúng phong cách.
- Đổi entity thì tạo migration: dotnet ef migrations add <Ten> -p src\ChoDoCu.Infrastructure -s src\ChoDoCu.API
- Phản hồi NGẮN: chỉ liệt kê file đã tạo/sửa. Không dán lại code, không giải thích dài, không tạo test hay tài liệu nếu không được yêu cầu.
- Cuối mỗi tác vụ chạy `dotnet build` và tự sửa lỗi build.

## Frontend (frontend/)
- React + TypeScript + Vite + Tailwind. Dùng theme trong tailwind.config.js và component có sẵn (Layout, Breadcrumbs, MaterialIcon, account/FormControls, account/AddressFields, MyPostItem). Không thêm thư viện mới, không tự thêm màu.
- Gọi API chỉ qua src/api/*.ts, kiểu dữ liệu ở src/types. Hợp đồng API: docs/api-bai-dang.md.
- Giao diện tiếng Việt; luôn có trạng thái loading, rỗng, lỗi (hiện message của API); xử lý 401/403/404 theo mã.
- Component nhỏ (<200 dòng), mỗi file một việc, không comment thừa, không tạo test hay tài liệu nếu không được yêu cầu.
- Phản hồi ngắn: chỉ liệt kê file đã tạo/sửa. Cuối mỗi tác vụ chạy `npm run build` trong frontend và sửa lỗi.