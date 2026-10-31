namespace ChoDoCu.Application.Common.Interfaces;

/// <summary>Thông tin người dùng Google lấy từ idToken đã xác minh.</summary>
public record GoogleUserInfo(string Subject, string Email, bool EmailVerified, string? Name, string? Picture);

public interface IGoogleTokenVerifier
{
    /// <returns>null nếu token sai chữ ký, hết hạn hoặc không dành cho ứng dụng này.</returns>
    Task<GoogleUserInfo?> XacThucAsync(string idToken);
}
