using System.Net;
using System.Net.Mail;
using ChoDoCu.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ChoDoCu.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IOptions<EmailSettings> options, ILogger<SmtpEmailService> logger)
    {
        _settings = options.Value;
        _logger = logger;
    }

    /// <summary>Gửi mã 6 số đặt lại mật khẩu (tham số ma thay cho token trong liên kết trước đây).</summary>
    public async Task GuiDatLaiMatKhauAsync(string email, string hoTen, string ma)
    {
        var body = $"""
            <p>Xin chào {WebUtility.HtmlEncode(hoTen)},</p>
            <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu tài khoản Chợ Đồ Cũ.</p>
            <p>Mã xác nhận của bạn: <b style="font-size:22px;letter-spacing:4px">{WebUtility.HtmlEncode(ma)}</b></p>
            <p>Mã chỉ có hiệu lực trong vài phút. Tuyệt đối không chia sẻ mã này cho ai. Nếu không phải bạn yêu cầu, hãy bỏ qua email này, mật khẩu của bạn không thay đổi.</p>
            """;

        await GuiAsync(email, "Mã đặt lại mật khẩu Chợ Đồ Cũ", body, $"Mã đặt lại mật khẩu của {email}: {ma}");
    }

    public async Task GuiMaDoiSoDienThoaiAsync(string email, string hoTen, string soDienThoaiMoi, string ma)
    {
        var body = $"""
            <p>Xin chào {WebUtility.HtmlEncode(hoTen)},</p>
            <p>Bạn vừa yêu cầu đổi số điện thoại tài khoản Chợ Đồ Cũ sang <b>{WebUtility.HtmlEncode(soDienThoaiMoi)}</b>.</p>
            <p>Mã xác nhận của bạn: <b style="font-size:22px;letter-spacing:4px">{WebUtility.HtmlEncode(ma)}</b></p>
            <p>Mã chỉ có hiệu lực trong vài phút. Nếu không phải bạn yêu cầu, hãy bỏ qua email này và đổi mật khẩu để bảo vệ tài khoản.</p>
            """;

        await GuiAsync(email, "Mã xác nhận đổi số điện thoại - Chợ Đồ Cũ", body, $"Mã đổi SĐT sang {soDienThoaiMoi}: {ma}");
    }

    private async Task GuiAsync(string den, string tieuDe, string noiDungHtml, string noiDungDeLog)
    {
        if (string.IsNullOrWhiteSpace(_settings.Host))
        {
            // Chưa cấu hình SMTP: ghi nội dung (mã) ra log để dev tự dùng thử.
            _logger.LogWarning("Email:Host chưa cấu hình, không gửi thật. Gửi tới {Den}: {NoiDung}", den, noiDungDeLog);
            return;
        }

        using var message = new MailMessage
        {
            From = new MailAddress(_settings.FromAddress, _settings.FromName),
            Subject = tieuDe,
            Body = noiDungHtml,
            IsBodyHtml = true
        };
        message.To.Add(den);

        using var client = new SmtpClient(_settings.Host, _settings.Port)
        {
            EnableSsl = _settings.EnableSsl,
            Credentials = new NetworkCredential(_settings.UserName, _settings.Password)
        };

        await client.SendMailAsync(message);
    }
}
