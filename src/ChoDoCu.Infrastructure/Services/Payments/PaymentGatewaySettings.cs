namespace ChoDoCu.Infrastructure.Services.Payments;

// Ánh xạ cấu hình Payment:MoMo trong appsettings hoặc secret store.
public sealed class MoMoSettings
{
    public string PartnerCode { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string Endpoint { get; set; } = "https://test-payment.momo.vn/v2/gateway/api/create";
    public string RedirectUrl { get; set; } = string.Empty;
    public string IpnUrl { get; set; } = string.Empty;
}

// Ánh xạ cấu hình Payment:VnPay trong appsettings hoặc secret store.
public sealed class VnPaySettings
{
    public string TmnCode { get; set; } = string.Empty;
    public string HashSecret { get; set; } = string.Empty;
    public string PaymentUrl { get; set; } = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public string ReturnUrl { get; set; } = string.Empty;
    public string ClientReturnUrl { get; set; } = string.Empty;
    public string IpnUrl { get; set; } = string.Empty;
    public string Locale { get; set; } = "vn";
    public int ExpireMinutes { get; set; } = 15;
}
