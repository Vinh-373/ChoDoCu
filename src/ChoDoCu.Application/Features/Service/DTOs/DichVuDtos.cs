namespace ChoDoCu.Application.Features.Service.DTOs;

// Dùng record để định nghĩa các DTO (Data Transfer Object) cho dịch vụ
// Record là một loại class đặc biệt trong C# được thiết kế để map dũ liệu , không cần tự khởi tạo get, set, constructor, equals, hashcode, toString
public record TaoDichVuRequest(
    string TenDichVu,
    decimal Gia,
    int ThoiGianDichVu,
    int LuotDay,
    int LuotDang);

public record CapNhatDichVuRequest(
    string TenDichVu,
    decimal Gia,
    int ThoiGianDichVu,
    int LuotDay,
    int LuotDang);

public record DichVuResponse(
    int Id,
    string TenDichVu,
    decimal Gia,
    int ThoiGianDichVu,
    int LuotDay,
    int LuotDang,
    DateTime NgayTao,
    string TrangThai);
