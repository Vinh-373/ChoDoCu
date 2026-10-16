using System.Security.Cryptography;
using System.Text;

namespace ChoDoCu.Infrastructure.Services.Payments;

internal static class GatewaySignature
{
    // Tạo chữ ký HMAC-SHA256 theo chuẩn MoMo.
    public static string HmacSha256Hex(string key, string data)
    {
        var hash = HMACSHA256.HashData(Encoding.UTF8.GetBytes(key), Encoding.UTF8.GetBytes(data));
        return Convert.ToHexStringLower(hash);
    }

    // Tạo chữ ký HMAC-SHA512 theo chuẩn VNPay.
    public static string HmacSha512Hex(string key, string data)
    {
        var hash = HMACSHA512.HashData(Encoding.UTF8.GetBytes(key), Encoding.UTF8.GetBytes(data));
        return Convert.ToHexStringLower(hash);
    }

    // So sánh chữ ký theo thời gian cố định để giảm nguy cơ rò rỉ thông tin qua thời gian xử lý.
    public static bool FixedTimeHexEquals(string expected, string? actual)
    {
        if (string.IsNullOrWhiteSpace(actual))
            return false;

        try
        {
            var expectedBytes = Convert.FromHexString(expected);
            var actualBytes = Convert.FromHexString(actual);
            return expectedBytes.Length == actualBytes.Length
                && CryptographicOperations.FixedTimeEquals(expectedBytes, actualBytes);
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
