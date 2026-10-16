
using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Application.Features.Notification.DTOs;
using Microsoft.AspNetCore.SignalR;

namespace ChoDoCu.API.Hubs;

public class ThongBaoNotifier : IThongBaoNotifier
{
    private readonly IHubContext<ChatHub> _hubContext;

    public ThongBaoNotifier(IHubContext<ChatHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task GuiThongBaoMoiAsync(
        int idNguoiDung,
        ThongBaoResponse thongBao)
    {
        await _hubContext.Clients
            .Group($"user_{idNguoiDung}")
            .SendAsync("ThongBaoMoi", thongBao);
    }
}
