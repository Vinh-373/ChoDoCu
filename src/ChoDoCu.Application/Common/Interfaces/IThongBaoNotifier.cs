
using ChoDoCu.Application.Features.Notification.DTOs;

namespace ChoDoCu.Application.Common.Interfaces;

public interface IThongBaoNotifier
{
    Task GuiThongBaoMoiAsync(
        int idNguoiDung,
        ThongBaoResponse thongBao);
}
