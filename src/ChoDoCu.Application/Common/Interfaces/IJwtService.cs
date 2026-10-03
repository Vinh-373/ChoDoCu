using ChoDoCu.Domain.Entities;

namespace ChoDoCu.Application.Common.Interfaces;

/// <summary>Application chỉ khai báo hợp đồng; code thật nằm ở Infrastructure/Services/JwtService.cs.</summary>
public interface IJwtService
{
    string TaoToken(NguoiDung nguoiDung);
}
