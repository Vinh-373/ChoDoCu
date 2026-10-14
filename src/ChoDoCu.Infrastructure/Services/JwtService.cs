using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Domain.Constants;
using ChoDoCu.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ChoDoCu.Infrastructure.Services;

public class JwtService : IJwtService
{
    private readonly JwtSettings _settings;

    public JwtService(IOptions<JwtSettings> options)
    {
        _settings = options.Value;

        // HS256 cần khóa >= 256 bit (32 byte), nếu ngắn hơn thư viện sẽ ném lỗi khó hiểu lúc ký.
        if (Encoding.UTF8.GetByteCount(_settings.Key ?? string.Empty) < 32)
            throw new InvalidOperationException("Jwt:Key phải dài ít nhất 32 ký tự.");
    }

    public JwtToken TaoToken(NguoiDung nguoiDung, IEnumerable<string> roles, IEnumerable<string> permissions)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, nguoiDung.Id.ToString()),
            new(ClaimTypes.Name, nguoiDung.HoTen),
            new(ClaimTypes.Email, nguoiDung.Email ?? string.Empty),
        };

        // Role -> dùng được [Authorize(Roles = "Admin")]
        claims.AddRange(roles.Distinct().Select(r => new Claim(ClaimTypes.Role, r)));

        // Quyền chi tiết -> dùng được [HasPermission("BaiDang.Duyet")]
        claims.AddRange(permissions.Distinct().Select(p => new Claim(AppPermissions.ClaimType, p)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(_settings.ExpireMinutes);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return new JwtToken(new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
