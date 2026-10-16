//Tạo dịch vụ gửi thông báo bằng SignalR

using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Application.Features.Chat.DTOs;
using Microsoft.AspNetCore.SignalR;

namespace ChoDoCu.API.Hubs;

public class ChatNotifier : IChatNotifier
{
    private readonly IHubContext<ChatHub> _hubContext;

    public ChatNotifier(IHubContext<ChatHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task GuiTinNhanMoiAsync(
        int idHoiThoai,
        int idNguoiNhan,
        TinNhanResponse tinNhan)
    {
        // Thông báo cho người nhận, kể cả khi họ chưa mở hội thoại.
        await _hubContext.Clients
            .Group($"user_{idNguoiNhan}")
            .SendAsync("TinNhanMoi", tinNhan);

        // Cập nhật những người đang mở hội thoại này.
        await _hubContext.Clients
            .Group($"hoi_thoai_{idHoiThoai}")
            .SendAsync("TinNhanMoi", tinNhan);
    }
}