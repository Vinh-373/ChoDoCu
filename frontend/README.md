# Chợ Đồ Cũ – Frontend (React + TypeScript + Vite)

Khớp với API của backend ASP.NET Core `ChoDoCu` (JWT + ASP.NET Identity).

## Chạy
1. **Xoá hẳn thư mục `frontend` cũ** (kể cả `node_modules`), rồi giải nén vào `D:\dotNet\ChoDoCu\`.
   Đừng giải nén đè lên project Vite có sẵn: `package.json`, `vite.config.ts`, `index.html` cũ sẽ không bị thay,
   dẫn tới thiếu proxy và trang trắng.
2. Chạy backend (`dotnet run --project src/ChoDoCu.API`) và xem cổng HTTPS trong
   `src/ChoDoCu.API/Properties/launchSettings.json`.
3. Mở file `.env`, sửa `VITE_PROXY_TARGET` thành đúng địa chỉ đó (ví dụ `https://localhost:7000`).
4. Trong thư mục `frontend`:
   ```
   npm install
   npm run dev
   ```
   Mở http://localhost:5173. Vite chuyển `/api` và `/uploads` sang backend nên không dính lỗi CORS/chứng chỉ.
5. Kiểm tra kiểu: `npm run build`.

Đăng nhập bằng tài khoản admin do `DbSeeder` tạo. Backend cần đã seed các role `Admin`, `Moderator`, `User`.

## Nếu trang không hiện dữ liệu
- Trang báo "Máy chủ trả về trang web thay vì dữ liệu API": BE chưa chạy hoặc `VITE_PROXY_TARGET` sai. Sửa `.env`, dừng và chạy lại `npm run dev`.
- Trang báo "Không kết nối được máy chủ": BE chưa chạy hoặc sai cổng.
- Mở F12 → Console/Network để xem request `/api/...` trả về gì.

## Cấu trúc
- `src/api` – mỗi file một nhóm endpoint, dùng chung `client.ts` (gắn Bearer token, báo hết phiên khi 401).
- `src/types` – kiểu DTO khớp backend.
- `src/contexts` – Toast, Auth, Favorites, Notification.
- `src/pages` – home, post, auth, account, chat, service, admin.
- `src/components/layout` – khung trang, mỗi phần một file:
  `Layout` (Header + nội dung + Footer) · `Header` gồm `Logo`, `SearchBar` (chọn thành phố + từ khoá), `HeaderNav`,
  `PostAdButton`, `UserMenu` và `Breadcrumbs` · `Footer` · `ContainerLayout` (khung rộng cho trang thường) · `AdminLayout`.
- `src/components/auth` – trang đăng nhập/đăng ký tách thành: `AuthLayout` (khung hai cột), `AuthShowcase` (cột trái quảng bá),
  `AuthFormHeader`, `AuthField`/`AuthSelect`, `SubmitButton`, `FormAlert`, `AuthSwitchPrompt`.
  `pages/auth/LoginPage` và `RegisterPage` chỉ còn phần form và gọi API.
- `src/index.css` – CSS cho các trang nội dung (tem giá, lưới tin, chat, quản trị…), đã đổi sang tông cam của thiết kế.
- `tailwind.config.js` – màu/khoảng cách/cỡ chữ lấy từ thiết kế. Tailwind dùng cho Header, Footer và khối auth;
  `preflight` và `container` tắt để không làm vỡ `index.css`.
- Icon dùng Material Symbols (nạp từ Google Fonts trong `index.html`, cần internet).

Route: `Layout` → `AuthLayout` (/dang-nhap, /dang-ky) và `ContainerLayout` (các trang còn lại), xem `src/App.tsx`.

## Giới hạn hiện tại (do backend chưa có endpoint)
- Đăng nhập chỉ bằng email (BE chưa hỗ trợ SĐT). Chưa có "Quên mật khẩu", "Ghi nhớ đăng nhập", đăng nhập Google/Facebook nên các phần này không đưa vào form.
- Chưa có API upload ảnh: người đăng dán URL ảnh (1–10 ảnh).
- Chưa có API danh sách tin chờ duyệt: trang "Duyệt bài" mở tin theo mã; staff cũng duyệt được ngay ở trang chi tiết.
- Lọc danh mục chỉ theo danh mục con (lá).
- Nút "giả lập thanh toán" chỉ để thử nghiệm; bản thật phải do cổng thanh toán báo về backend.
- Tin nhắn cập nhật bằng polling 5 giây (chưa dùng SignalR).
