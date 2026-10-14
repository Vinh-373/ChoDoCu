using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Application.Common.Interfaces;

public record JwtToken(string Token, DateTime ExpiresAtUtc);

/// <summary>Application chỉ khai báo hợp đồng; code thật nằm ở Infrastructure/Services/JwtService.cs.</summary>
public interface IJwtService
{
    JwtToken TaoToken(NguoiDung nguoiDung, IEnumerable<string> roles, IEnumerable<string> permissions);
}
