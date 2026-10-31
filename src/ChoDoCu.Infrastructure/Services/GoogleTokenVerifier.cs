using ChoDoCu.Application.Common.Interfaces;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ChoDoCu.Infrastructure.Services;

/// <summary>Xác minh idToken của Google bằng thư viện chính thức Google.Apis.Auth.</summary>
public class GoogleTokenVerifier : IGoogleTokenVerifier
{
    private readonly string _clientId;
    private readonly ILogger<GoogleTokenVerifier> _logger;

    public GoogleTokenVerifier(IConfiguration config, ILogger<GoogleTokenVerifier> logger)
    {
        _clientId = config["Google:ClientId"]
            ?? throw new InvalidOperationException("Thiếu cấu hình Google:ClientId trong appsettings.");
        _logger = logger;
    }

    public async Task<GoogleUserInfo?> XacThucAsync(string idToken)
    {
        try
        {
            // Kiểm tra chữ ký, thời hạn và Audience phải đúng ClientId của ứng dụng.
            var payload = await GoogleJsonWebSignature.ValidateAsync(
                idToken,
                new GoogleJsonWebSignature.ValidationSettings { Audience = new[] { _clientId } });

            return new GoogleUserInfo(payload.Subject, payload.Email, payload.EmailVerified, payload.Name, payload.Picture);
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogWarning(ex, "idToken Google không hợp lệ.");
            return null;
        }
    }
}
