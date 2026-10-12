using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using ChoDoCu.Application.Features.Payment.DTOs;
using ChoDoCu.Application.Features.Payment.Interfaces;
using ChoDoCu.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ChoDoCu.Infrastructure.Services.Payments;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/thanh-toan")]
// API cho người mua và hai cổng thanh toán gửi thông báo giao dịch.
public class ThanhToanController : ControllerBase
{
    private readonly IThanhToanService _service;
    private readonly IReadOnlyList<IPaymentGateway> _gateways;
    private readonly VnPaySettings _vnPaySettings;

    public ThanhToanController(
        IThanhToanService service,
        IEnumerable<IPaymentGateway> gateways,
        IOptions<VnPaySettings> vnPaySettings)
    {
        _service = service;
        _gateways = gateways.ToList();
        _vnPaySettings = vnPaySettings.Value;
    }

    // Các route dành cho người dùng đăng nhập; service lấy danh tính từ claim, không nhận userId từ client.
    [Authorize(Roles = "User")]
    [HttpPost("mua-dich-vu")]
    public async Task<IActionResult> MuaDichVu(MuaDichVuRequest request)
        => Ok(await _service.MuaDichVuAsync(
            GetUserId(), request, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1"));

    [Authorize(Roles = "User")]
    [HttpGet("lich-su-mua-dich-vu")]
    public async Task<IActionResult> LichSuMuaDichVu()
        => Ok(await _service.LichSuMuaDichVuAsync(GetUserId()));

    [Authorize(Roles = "User")]
    [HttpGet("{idThanhToan:int}/trang-thai")]
    public async Task<IActionResult> TrangThai(int idThanhToan)
        => Ok(await _service.TrangThaiAsync(GetUserId(), idThanhToan));

    // MoMo gửi IPN dạng JSON; chuyển các scalar field cho tầng service xác thực chữ ký và cập nhật thanh toán.
    [AllowAnonymous]
    [HttpPost("callback/momo")]
    public async Task<IActionResult> CallbackMoMo(CancellationToken cancellationToken)
    {
        using var document = await JsonDocument.ParseAsync(Request.Body, cancellationToken: cancellationToken);
        if (document.RootElement.ValueKind != JsonValueKind.Object)
            return BadRequest(new { resultCode = 1, message = "Invalid request" });

        var parameters = document.RootElement.EnumerateObject()
            .Where(x => x.Value.ValueKind is JsonValueKind.String or JsonValueKind.Number or JsonValueKind.True or JsonValueKind.False)
            .ToDictionary(x => x.Name, x => x.Value.ToString(), StringComparer.Ordinal);

        try
        {
            await _service.XuLyCallbackAsync("Momo", parameters);
            return NoContent();
        }
        catch (DomainException)
        {
            return BadRequest();
        }
        catch (NotFoundException)
        {
            return BadRequest();
        }
    }

    // VNPay gửi IPN qua query string và yêu cầu mã phản hồi theo giao thức của VNPay.
    [AllowAnonymous]
    [HttpGet("callback/vnpay-ipn")]
    public async Task<IActionResult> CallbackVnPayIpn()
    {
        var parameters = Request.Query.ToDictionary(
            x => x.Key, x => x.Value.ToString(), StringComparer.Ordinal);

        try
        {
            await _service.XuLyCallbackAsync("VNPay", parameters);
            return new JsonResult(new VnPayIpnResponse("00", "Confirm Success"));
        }
        catch (DomainException)
        {
            return new JsonResult(new VnPayIpnResponse("97", "Invalid transaction"));
        }
        catch (NotFoundException)
        {
            return new JsonResult(new VnPayIpnResponse("01", "Order not found"));
        }
    }

    // URL này chỉ xác thực kết quả để báo cho trình duyệt; cập nhật DB chỉ thực hiện qua IPN.
    [AllowAnonymous]
    [HttpGet("return/vnpay")]
    public IActionResult ReturnVnPay()
    {
        if (!Uri.TryCreate(_vnPaySettings.ClientReturnUrl, UriKind.Absolute, out var clientReturnUrl))
            return StatusCode(StatusCodes.Status503ServiceUnavailable);

        var paymentId = Request.Query["paymentId"].ToString();
        var isVerified = false;
        try
        {
            var gateway = _gateways.First(x =>
                string.Equals(x.TenPhuongThuc, "VNPay", StringComparison.OrdinalIgnoreCase));
            var parameters = Request.Query.ToDictionary(
                x => x.Key, x => x.Value.ToString(), StringComparer.Ordinal);
            gateway.XacThucCallback(parameters);
            isVerified = true;
        }
        catch (DomainException)
        {
            // Browser return is informational only; the IPN is the sole path that updates payment state.
        }
        catch (InvalidOperationException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable);
        }

        var builder = new UriBuilder(clientReturnUrl);
        var query = builder.Query.TrimStart('?');
        var returnStatus = isVerified ? "returned" : "unverified";
        var additions = $"paymentId={Uri.EscapeDataString(paymentId)}&paymentReturn={returnStatus}";
        builder.Query = string.IsNullOrEmpty(query) ? additions : $"{query}&{additions}";
        return Redirect(builder.Uri.ToString());
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Định dạng mã phản hồi mà VNPay yêu cầu cho endpoint IPN.
    private sealed record VnPayIpnResponse(
        [property: JsonPropertyName("RspCode")] string RspCode,
        [property: JsonPropertyName("Message")] string Message);
}
