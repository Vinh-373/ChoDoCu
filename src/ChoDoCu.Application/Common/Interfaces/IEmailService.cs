namespace ChoDoCu.Application.Common.Interfaces;

/// <summary>Gửi email. Code thật (SMTP) nằm ở Infrastructure/Services/SmtpEmailService.cs.</summary>
public interface IEmailService
{
    /// <summary>Gửi email chứa liên kết đặt lại mật khẩu. token là token thô do Identity tạo (chưa mã hóa URL).</summary>
    Task GuiDatLaiMatKhauAsync(string email, string hoTen, string token);
    Task GuiMaDoiSoDienThoaiAsync(string email, string hoTen, string soDienThoaiMoi, string ma);
}
