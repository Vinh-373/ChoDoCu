namespace ChoDoCu.Infrastructure.Services;

/// <summary>Map từ mục "Email" trong appsettings.json.</summary>
public class EmailSettings
{
    /// <summary>Để trống = không gửi thật, chỉ ghi liên kết vào log (tiện khi phát triển).</summary>
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromAddress { get; set; } = string.Empty;
    public string FromName { get; set; } = "Chợ Đồ Cũ";

    /// <summary>Địa chỉ trang đặt lại mật khẩu của frontend, vd http://localhost:3000/dat-lai-mat-khau</summary>
    public string ResetPasswordUrl { get; set; } = "http://localhost:3000/dat-lai-mat-khau";

    /// <summary>Thời hạn liên kết (giờ). Mặc định của Identity là 24 giờ, đặt ngắn hơn cho an toàn.</summary>
    public int ResetTokenHours { get; set; } = 1;
}
