using ChoDoCu.Application.Common.Interfaces;

namespace ChoDoCu.Infrastructure.Services;

public class PasswordHasher : IPasswordHasher
{
    public string Hash(string matKhau) => BCrypt.Net.BCrypt.HashPassword(matKhau);

    public bool Verify(string matKhau, string hash) => BCrypt.Net.BCrypt.Verify(matKhau, hash);
}
