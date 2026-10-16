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

    public async Task GuiDatLaiMatKhauAsync(string email, string hoTen, string token)
    {
        var separator = _settings.ResetPasswordUrl.Contains('?') ? '&' : '?';
        var link = $"{_settings.ResetPasswordUrl}{separator}email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";

        var body = $"""
            <p>Xin chào {WebUtility.HtmlEncode(hoTen)},</p>
            <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu tài khoản Chợ Đồ Cũ.</p>
            <p><a href="{WebUtility.HtmlEncode(link)}">Bấm vào đây để đặt mật khẩu mới</a></p>
            <p>Liên kết có hiệu lực trong {_settings.ResetTokenHours} giờ. Nếu không phải bạn yêu cầu, hãy bỏ qua email này, mật khẩu của bạn không thay đổi.</p>
            """;

        await GuiAsync(email, "Đặt lại mật khẩu Chợ Đồ Cũ", body, link);
    }

    private async Task GuiAsync(string den, string tieuDe, string noiDungHtml, string linkDeLog)
    {
        if (string.IsNullOrWhiteSpace(_settings.Host))
        {
            // Chưa cấu hình SMTP: ghi liên kết ra log để dev tự bấm thử.
            _logger.LogWarning("Email:Host chưa cấu hình, không gửi thật. Gửi tới {Den}: {Link}", den, linkDeLog);
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
