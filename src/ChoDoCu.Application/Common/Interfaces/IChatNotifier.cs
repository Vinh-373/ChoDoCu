using ChoDoCu.Application.Features.Chat.DTOs;

namespace ChoDoCu.Application.Common.Interfaces;

public interface IChatNotifier
{
    Task GuiTinNhanMoiAsync(
        int idHoiThoai,
        int idNguoiNhan,
        TinNhanResponse tinNhan);
}


//Interface này giúp TinNhanService gửi yêu cầu thông báo mà không cần biết SignalR hoạt động bên trong như thế nào.