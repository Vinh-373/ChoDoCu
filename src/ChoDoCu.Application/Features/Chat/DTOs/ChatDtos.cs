namespace ChoDoCu.Application.Features.Chat.DTOs;

public record GuiTinNhanRequest(int IdNguoiNhan, string NoiDung);

public record HoiThoaiResponse(
    int Id, int IdNguoiDungKia, string TenNguoiDungKia, string? AnhNguoiDungKia, DateTime? TinNhanCuoi);

public record TinNhanResponse(int Id, int IdHoiThoai, int IdNguoiGui, string NoiDung, bool DaXem, DateTime NgayTao);
