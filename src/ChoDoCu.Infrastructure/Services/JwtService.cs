using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ChoDoCu.Infrastructure.Services;

public class JwtService : IJwtService
{
    private readonly JwtSettings _settings;

    public JwtService(IOptions<JwtSettings> options) => _settings = options.Value;

    public string TaoToken(NguoiDung nguoiDung)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, nguoiDung.Id.ToString()),
            new(ClaimTypes.Name, nguoiDung.HoTen),
            new(ClaimTypes.Email, nguoiDung.Email),
            new(ClaimTypes.Role, nguoiDung.Role.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_settings.ExpireMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
