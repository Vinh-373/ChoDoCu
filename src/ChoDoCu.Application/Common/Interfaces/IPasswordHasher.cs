namespace ChoDoCu.Application.Common.Interfaces;

public interface IPasswordHasher
{
    string Hash(string matKhau);
    bool Verify(string matKhau, string hash);
}
