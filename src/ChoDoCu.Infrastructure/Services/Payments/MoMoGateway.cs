using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using ChoDoCu.Application.Features.Payment.Interfaces;
using ChoDoCu.Domain.Exceptions;
using Microsoft.Extensions.Options;

using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace ChoDoCu.Infrastructure.Services.Payments;

public sealed class MoMoGateway : IPaymentGateway
{
    // private readonly HttpClient _httpClient;
    // private readonly MoMoSettings _settings;

    // public MoMoGateway(HttpClient httpClient, IOptions<MoMoSettings> settings)
    // {
    //     _httpClient = httpClient;
    //     _settings = settings.Value;
    //     _httpClient.Timeout = TimeSpan.FromSeconds(35);
    // }
    private readonly HttpClient _httpClient;
    private readonly MoMoSettings _settings;
    private readonly ILogger<MoMoGateway> _logger;

    public MoMoGateway(HttpClient httpClient, IOptions<MoMoSettings> settings, ILogger<MoMoGateway> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
        _httpClient.Timeout = TimeSpan.FromSeconds(35);
    }

    public string TenPhuongThuc => "Momo";

    public async Task<string> TaoUrlThanhToanAsync(
        TaoLienKetThanhToanRequest request,
        CancellationToken cancellationToken = default)
    {
        // Kiểm tra cấu hình và giới hạn số tiền trước khi gửi yêu cầu ra MoMo.
        ValidateSettings();
        if (request.SoTien is < 1000m or > 50_000_000m)
            throw new DomainException("MoMo chỉ hỗ trợ giao dịch từ 1.000 đến 50.000.000 VND.");
        var amount = Convert.ToInt64(request.SoTien, CultureInfo.InvariantCulture);
        var requestId = $"REQ{Guid.NewGuid():N}";
        var orderInfo = request.NoiDung.Length <= 255 ? request.NoiDung : request.NoiDung[..255];
        var redirectUrl = AddPaymentId(_settings.RedirectUrl, request.IdThanhToan);
        const string extraData = "";
        const string requestType = "captureWallet";

        // Ghép chuỗi theo đúng thứ tự trường MoMo yêu cầu để ký dữ liệu tạo đơn.
        var rawSignature = string.Join("&", new[]
        {
            $"accessKey={_settings.AccessKey}",
            $"amount={amount}",
            $"extraData={extraData}",
            $"ipnUrl={_settings.IpnUrl}",
            $"orderId={request.MaGiaoDich}",
            $"orderInfo={orderInfo}",
            $"partnerCode={_settings.PartnerCode}",
            $"redirectUrl={redirectUrl}",
            $"requestId={requestId}",
            $"requestType={requestType}"
        });

        // Gửi yêu cầu tạo thanh toán, sau đó xác minh chữ ký và dữ liệu phản hồi của MoMo.
        var body = new MoMoCreateRequest
        {
            PartnerCode = _settings.PartnerCode,
            RequestId = requestId,
            Amount = amount,
            OrderId = request.MaGiaoDich,
            OrderInfo = orderInfo,
            RedirectUrl = redirectUrl,
            IpnUrl = _settings.IpnUrl,
            RequestType = requestType,
            ExtraData = extraData,
            Lang = "vi",
            Signature = GatewaySignature.HmacSha256Hex(_settings.SecretKey, rawSignature)
        };

        // using var response = await _httpClient.PostAsJsonAsync(_settings.Endpoint, body, cancellationToken);
        // response.EnsureSuccessStatusCode();
        // var result = await response.Content.ReadFromJsonAsync<MoMoCreateResponse>(cancellationToken: cancellationToken)
        //     ?? throw new DomainException("MoMo trả về phản hồi rỗng.");
        using var response = await _httpClient.PostAsJsonAsync(_settings.Endpoint, body, cancellationToken);
        var raw = await response.Content.ReadAsStringAsync(cancellationToken);
        _logger.LogInformation("MoMo create: HTTP {Status}, body: {Body}", (int)response.StatusCode, raw);

        MoMoCreateResponse? result;
        try { result = JsonSerializer.Deserialize<MoMoCreateResponse>(raw); }
        catch (JsonException) { throw new DomainException($"MoMo trả về dữ liệu không phải JSON (HTTP {(int)response.StatusCode})."); }
        if (result is null)
            throw new DomainException("MoMo trả về phản hồi rỗng.");

        // var responseData = string.Join("&", new[]
        // {
        //     $"accessKey={_settings.AccessKey}",
        //     $"amount={result.Amount.ToString(CultureInfo.InvariantCulture)}",
        //     $"message={result.Message}",
        //     $"orderId={result.OrderId}",
        //     $"partnerCode={result.PartnerCode}",
        //     $"payUrl={result.PayUrl}",
        //     $"requestId={result.RequestId}",
        //     $"responseTime={result.ResponseTime.ToString(CultureInfo.InvariantCulture)}",
        //     $"resultCode={result.ResultCode.ToString(CultureInfo.InvariantCulture)}"
        // });

        // if (!GatewaySignature.FixedTimeHexEquals(
        //         GatewaySignature.HmacSha256Hex(_settings.SecretKey, responseData), result.Signature)
        //     || result.ResultCode != 0
        //     || result.Amount != amount
        //     || result.OrderId != request.MaGiaoDich
        //     || string.IsNullOrWhiteSpace(result.PayUrl))
        //     throw new DomainException("Không xác thực được phản hồi khởi tạo thanh toán từ MoMo.");

        if (result.ResultCode != 0)
            throw new DomainException($"MoMo từ chối tạo thanh toán (resultCode {result.ResultCode}): {result.Message}");

        if (result.Amount != amount
            || result.OrderId != request.MaGiaoDich
            || result.RequestId != requestId
            || string.IsNullOrWhiteSpace(result.PayUrl))
            throw new DomainException("Phản hồi khởi tạo thanh toán từ MoMo không khớp với yêu cầu.");

        return result.PayUrl;
    }

    public KetQuaCallbackCongThanhToan XacThucCallback(IReadOnlyDictionary<string, string> thamSo)
    {
        // Đọc các trường bắt buộc và xác nhận callback đến đúng tài khoản đối tác.
        ValidateSettings();
        var partnerCode = Required(thamSo, "partnerCode");
        var orderId = Required(thamSo, "orderId");
        var amount = long.Parse(Required(thamSo, "amount"), CultureInfo.InvariantCulture);
        var resultCode = int.Parse(Required(thamSo, "resultCode"), CultureInfo.InvariantCulture);
        var transactionId = Required(thamSo, "transId");
        var responseTime = long.Parse(Required(thamSo, "responseTime"), CultureInfo.InvariantCulture);
        var signature = Required(thamSo, "signature");

        if (!string.Equals(partnerCode, _settings.PartnerCode, StringComparison.Ordinal))
            throw new DomainException("MoMo partnerCode không khớp.");

        // Tính lại chữ ký trên bộ tham số theo quy tắc MoMo; chỉ trả kết quả đã xác thực.
        var responseData = string.Join("&", new[]
        {
            $"accessKey={_settings.AccessKey}",
            $"amount={amount.ToString(CultureInfo.InvariantCulture)}",
            $"extraData={Optional(thamSo, "extraData")}",
            $"message={Optional(thamSo, "message")}",
            $"orderId={orderId}",
            $"orderInfo={Optional(thamSo, "orderInfo")}",
            $"orderType={Optional(thamSo, "orderType")}",
            $"partnerCode={partnerCode}",
            $"payType={Optional(thamSo, "payType")}",
            $"requestId={Required(thamSo, "requestId")}",
            $"responseTime={Required(thamSo, "responseTime")}",
            $"resultCode={resultCode.ToString(CultureInfo.InvariantCulture)}",
            $"transId={transactionId}"
        });

        if (!GatewaySignature.FixedTimeHexEquals(
                GatewaySignature.HmacSha256Hex(_settings.SecretKey, responseData), signature))
            throw new DomainException("Chữ ký callback MoMo không hợp lệ.");

        return new KetQuaCallbackCongThanhToan(
            orderId,
            amount,
            resultCode == 0,
            transactionId,
            resultCode.ToString(CultureInfo.InvariantCulture),
            DateTimeOffset.FromUnixTimeMilliseconds(responseTime)
                .ToOffset(TimeSpan.FromHours(7))
                .DateTime);
    }

    private void ValidateSettings()
    {
        // Chặn xử lý nếu thiếu khóa bí mật hoặc endpoint/URL callback không hợp lệ.
        if (string.IsNullOrWhiteSpace(_settings.PartnerCode)
            || string.IsNullOrWhiteSpace(_settings.AccessKey)
            || string.IsNullOrWhiteSpace(_settings.SecretKey)
            || !Uri.TryCreate(_settings.Endpoint, UriKind.Absolute, out _)
            || !Uri.TryCreate(_settings.RedirectUrl, UriKind.Absolute, out _)
            || !Uri.TryCreate(_settings.IpnUrl, UriKind.Absolute, out _))
            throw new InvalidOperationException("Cấu hình MoMo chưa đầy đủ hoặc URL không hợp lệ.");
    }

    private static string AddPaymentId(string url, int idThanhToan)
    {
        // Gắn mã thanh toán nội bộ vào URL quay về để frontend tra cứu trạng thái giao dịch.
        var builder = new UriBuilder(url);
        var query = builder.Query.TrimStart('?');
        builder.Query = string.IsNullOrEmpty(query)
            ? $"paymentId={idThanhToan}"
            : $"{query}&paymentId={idThanhToan}";
        return builder.Uri.ToString();
    }

    private static string Required(IReadOnlyDictionary<string, string> values, string key) =>
        values.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value)
            ? value
            : throw new DomainException($"Thiếu tham số callback MoMo: {key}.");

    private static string Optional(IReadOnlyDictionary<string, string> values, string key) =>
        values.TryGetValue(key, out var value) ? value : string.Empty;

    // DTO riêng ánh xạ chính xác tên trường JSON trong API tạo giao dịch MoMo.
    private sealed class MoMoCreateRequest
    {
        [JsonPropertyName("partnerCode")] public string PartnerCode { get; init; } = string.Empty;
        [JsonPropertyName("requestId")] public string RequestId { get; init; } = string.Empty;
        [JsonPropertyName("amount")] public long Amount { get; init; }
        [JsonPropertyName("orderId")] public string OrderId { get; init; } = string.Empty;
        [JsonPropertyName("orderInfo")] public string OrderInfo { get; init; } = string.Empty;
        [JsonPropertyName("redirectUrl")] public string RedirectUrl { get; init; } = string.Empty;
        [JsonPropertyName("ipnUrl")] public string IpnUrl { get; init; } = string.Empty;
        [JsonPropertyName("requestType")] public string RequestType { get; init; } = string.Empty;
        [JsonPropertyName("extraData")] public string ExtraData { get; init; } = string.Empty;
        [JsonPropertyName("lang")] public string Lang { get; init; } = string.Empty;
        [JsonPropertyName("signature")] public string Signature { get; init; } = string.Empty;
    }

    // DTO đọc phản hồi MoMo để kiểm tra trạng thái, số tiền, mã đơn và chữ ký.
    private sealed class MoMoCreateResponse
    {
        [JsonPropertyName("partnerCode")] public string PartnerCode { get; init; } = string.Empty;
        [JsonPropertyName("requestId")] public string RequestId { get; init; } = string.Empty;
        [JsonPropertyName("amount")] public long Amount { get; init; }
        [JsonPropertyName("orderId")] public string OrderId { get; init; } = string.Empty;
        [JsonPropertyName("responseTime")] public long ResponseTime { get; init; }
        [JsonPropertyName("message")] public string Message { get; init; } = string.Empty;
        [JsonPropertyName("resultCode")] public int ResultCode { get; init; }
        [JsonPropertyName("payUrl")] public string PayUrl { get; init; } = string.Empty;
        [JsonPropertyName("signature")] public string Signature { get; init; } = string.Empty;
    }
}
