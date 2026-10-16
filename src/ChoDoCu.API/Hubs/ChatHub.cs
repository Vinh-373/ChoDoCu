using System.Security.Claims;
using ChoDoCu.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ChoDoCu.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IUnitOfWork _uow;

    public ChatHub(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?
            .FindFirstValue(ClaimTypes.NameIdentifier);

        if (int.TryParse(userId, out var idNguoiDung))
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"user_{idNguoiDung}");
        }

        await base.OnConnectedAsync();
    }

    public async Task ThamGiaHoiThoai(int idHoiThoai)
    {
        var idNguoiDung = LayIdNguoiDung();

        if (idHoiThoai <= 0)
        {
            throw new HubException(
                "ID hội thoại không hợp lệ.");
        }

        // Tìm hội thoại trong cơ sở dữ liệu.
        var hoiThoai = await _uow.HoiThois
            .GetByIdAsync(idHoiThoai);

        if (hoiThoai is null)
        {
            throw new HubException(
                "Hội thoại không tồn tại.");
        }

        // Chỉ hai người tham gia hội thoại mới được vào nhóm.
        var coQuyenThamGia =
            hoiThoai.IdNguoiDung1 == idNguoiDung ||
            hoiThoai.IdNguoiDung2 == idNguoiDung;

        if (!coQuyenThamGia)
        {
            throw new HubException(
                "Bạn không có quyền tham gia hội thoại này.");
        }

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            $"hoi_thoai_{idHoiThoai}");
    }

    public async Task RoiHoiThoai(int idHoiThoai)
    {
        var idNguoiDung = LayIdNguoiDung();

        if (idHoiThoai <= 0)
        {
            throw new HubException(
                "ID hội thoại không hợp lệ.");
        }

        // Chỉ người tham gia hội thoại mới được thao tác với nhóm.
        var hoiThoai = await _uow.HoiThois
            .GetByIdAsync(idHoiThoai);

        if (hoiThoai is null ||
            (hoiThoai.IdNguoiDung1 != idNguoiDung &&
             hoiThoai.IdNguoiDung2 != idNguoiDung))
        {
            throw new HubException(
                "Bạn không có quyền truy cập hội thoại này.");
        }

        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            $"hoi_thoai_{idHoiThoai}");
    }

    private int LayIdNguoiDung()
    {
        var userId = Context.User?
            .FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userId, out var idNguoiDung))
        {
            throw new HubException(
                "Không xác định được người dùng.");
        }

        return idNguoiDung;
    }
}
