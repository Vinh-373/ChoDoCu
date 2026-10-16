using System.Globalization;
using System.Net;
using System.Net.Sockets;
using System.Text;
using ChoDoCu.Application.Features.Payment.Interfaces;
using ChoDoCu.Domain.Exceptions;
using Microsoft.Extensions.Options;

namespace ChoDoCu.Infrastructure.Services.Payments;

public sealed class VnPayGateway : IPaymentGateway
{
    private readonly VnPaySettings _settings;

    public VnPayGateway(IOptions<VnPaySettings> settings) => _settings = settings.Value;

    public string TenPhuongThuc => "VNPay";

    public Task<string> TaoUrlThanhToanAsync(
        TaoLienKetThanhToanRequest request,
        CancellationToken cancellationToken = default)
    {
        // Kiểm tra cấu hình và quy tắc số tiền trước khi tạo URL thanh toán.
        ValidateSettings();
        cancellationToken.ThrowIfCancellationRequested();
        if (request.SoTien < 5000m)
            throw new DomainException("VNPay yêu cầu giá trị giao dịch tối thiểu 5.000 VND.");

        // VNPay nhận số tiền theo đơn vị 1/100 VND và yêu cầu thời gian GMT+7.
        var now = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(7));
        var expire = now.AddMinutes(_settings.ExpireMinutes);
        var amount = decimal.ToInt64(request.SoTien * 100m);
        var parameters = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["vnp_Version"] = "2.1.0",
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = _settings.TmnCode,
            ["vnp_Amount"] = amount.ToString(CultureInfo.InvariantCulture),
            ["vnp_CurrCode"] = "VND",
            ["vnp_TxnRef"] = request.MaGiaoDich,
            ["vnp_OrderInfo"] = ToAsciiOrderInfo(request.NoiDung),
            ["vnp_OrderType"] = "other",
            ["vnp_Locale"] = _settings.Locale,
            ["vnp_ReturnUrl"] = AddPaymentId(_settings.ReturnUrl, request.IdThanhToan),
            ["vnp_IpAddr"] = NormalizeIp(request.DiaChiIp),
            ["vnp_CreateDate"] = now.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture),
            ["vnp_ExpireDate"] = expire.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture)
        };

        // Sắp xếp tham số, mã hóa query rồi ký toàn bộ dữ liệu để VNPay xác minh.
        var signData = BuildQuery(parameters);
        var signature = GatewaySignature.HmacSha512Hex(_settings.HashSecret, signData);
        return Task.FromResult($"{_settings.PaymentUrl}?{signData}&vnp_SecureHash={signature}");
    }

    public KetQuaCallbackCongThanhToan XacThucCallback(IReadOnlyDictionary<string, string> thamSo)
    {
        // Lấy các trường được ký và dựng lại dữ liệu theo thứ tự chuẩn của VNPay.
        ValidateSettings();
        var signature = Required(thamSo, "vnp_SecureHash");
        var signedParameters = new SortedDictionary<string, string>(StringComparer.Ordinal);

        foreach (var pair in thamSo)
        {
            if (pair.Key.StartsWith("vnp_", StringComparison.Ordinal)
                && pair.Key is not "vnp_SecureHash" and not "vnp_SecureHashType")
                signedParameters[pair.Key] = pair.Value;
        }

        // Chỉ chấp nhận callback đúng chữ ký và đúng mã merchant đã cấu hình.
        if (!GatewaySignature.FixedTimeHexEquals(
                GatewaySignature.HmacSha512Hex(_settings.HashSecret, BuildQuery(signedParameters)), signature))
            throw new DomainException("Checksum callback VNPay không hợp lệ.");

        var tmnCode = Required(thamSo, "vnp_TmnCode");
        if (!string.Equals(tmnCode, _settings.TmnCode, StringComparison.Ordinal))
            throw new DomainException("VNPay TmnCode không khớp.");

        // Chuyển số tiền VNPay (đã nhân 100) về VND và chuẩn hóa kết quả giao dịch.
        var amountScaled = long.Parse(Required(thamSo, "vnp_Amount"), CultureInfo.InvariantCulture);
        if (amountScaled % 100 != 0)
            throw new DomainException("Số tiền callback VNPay không hợp lệ.");

        var responseCode = Required(thamSo, "vnp_ResponseCode");
        var transactionStatus = Required(thamSo, "vnp_TransactionStatus");
        var transactionNo = Required(thamSo, "vnp_TransactionNo");
        DateTime? paidAt = null;
        if (DateTime.TryParseExact(
                Optional(thamSo, "vnp_PayDate"),
                "yyyyMMddHHmmss",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var parsed))
            paidAt = parsed;

        return new KetQuaCallbackCongThanhToan(
            Required(thamSo, "vnp_TxnRef"),
            amountScaled / 100m,
            responseCode == "00" && transactionStatus == "00",
            transactionNo,
            $"{responseCode}:{transactionStatus}",
            paidAt);
    }

    private void ValidateSettings()
    {
        // Đảm bảo endpoint, URL trả về và thời hạn giao dịch được cấu hình hợp lệ.
        if (string.IsNullOrWhiteSpace(_settings.TmnCode)
            || string.IsNullOrWhiteSpace(_settings.HashSecret)
            || !Uri.TryCreate(_settings.PaymentUrl, UriKind.Absolute, out _)
            || !Uri.TryCreate(_settings.ReturnUrl, UriKind.Absolute, out _)
            || !Uri.TryCreate(_settings.ClientReturnUrl, UriKind.Absolute, out _)
            || !Uri.TryCreate(_settings.IpnUrl, UriKind.Absolute, out _)
            || _settings.ExpireMinutes is < 5 or > 60)
            throw new InvalidOperationException("Cấu hình VNPay chưa đầy đủ hoặc không hợp lệ.");
    }

    // Tạo query theo thứ tự đầu vào; SortedDictionary giúp giữ thứ tự ký ổn định.
    private static string BuildQuery(IEnumerable<KeyValuePair<string, string>> parameters) =>
        string.Join("&", parameters.Select(x =>
            $"{WebUtility.UrlEncode(x.Key)}={WebUtility.UrlEncode(x.Value)}"));

    private static string AddPaymentId(string url, int idThanhToan)
    {
        var builder = new UriBuilder(url);
        var query = builder.Query.TrimStart('?');
        builder.Query = string.IsNullOrEmpty(query)
            ? $"paymentId={idThanhToan}"
            : $"{query}&paymentId={idThanhToan}";
        return builder.Uri.ToString();
    }

    private static string NormalizeIp(string ipAddress)
    {
        // Chuẩn hóa địa chỉ IP theo định dạng VNPay hỗ trợ; dùng loopback nếu đầu vào không hợp lệ.
        if (!IPAddress.TryParse(ipAddress, out var parsed))
            return "127.0.0.1";
        if (parsed.AddressFamily == AddressFamily.InterNetworkV6)
            return parsed.IsIPv4MappedToIPv6 ? parsed.MapToIPv4().ToString() : "127.0.0.1";
        return parsed.ToString();
    }

    private static string ToAsciiOrderInfo(string value)
    {
        // Loại dấu tiếng Việt và ký tự ngoài tập ký tự cho phép trong nội dung đơn hàng.
        var decomposed = value.Normalize(NormalizationForm.FormD);
        var result = new StringBuilder(decomposed.Length);
        foreach (var character in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) == UnicodeCategory.NonSpacingMark)
                continue;
            if (char.IsAsciiLetterOrDigit(character) || character is ' ' or '-' or '_' or '.')
                result.Append(character);
        }
        return result.ToString().Trim();
    }

    private static string Required(IReadOnlyDictionary<string, string> values, string key) =>
        values.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value)
            ? value
            : throw new DomainException($"Thiếu tham số callback VNPay: {key}.");

    private static string Optional(IReadOnlyDictionary<string, string> values, string key) =>
        values.TryGetValue(key, out var value) ? value : string.Empty;
}
