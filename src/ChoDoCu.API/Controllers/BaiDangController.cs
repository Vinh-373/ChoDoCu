using ChoDoCu.Domain.Constants;
using ChoDoCu.API.Authorization;
using System.Security.Claims;
using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Application.Features.Post.DTOs;
using ChoDoCu.Application.Features.Post.Interfaces;
using ChoDoCu.Application.Features.Search.Interfaces;
using ChoDoCu.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/bai-dang")]
public class BaiDangController : ControllerBase
{
    private readonly IBaiDangService _baiDangService;
    private readonly ITimKiemService _timKiemService;
    private readonly IFileStorage _fileStorage;

    public BaiDangController(
        IBaiDangService baiDangService,
        ITimKiemService timKiemService,
        IFileStorage fileStorage)
    {
        _baiDangService = baiDangService;
        _timKiemService = timKiemService;
        _fileStorage = fileStorage;
    }

    [HttpGet]
    public async Task<IActionResult> TimKiem(
        [FromQuery] int? idDanhMuc,
        [FromQuery] int? idThanhPho,
        [FromQuery] int? idPhuongXa,
        [FromQuery] string? keyword,
        [FromQuery] string? tuKhoa = null,
        [FromQuery] decimal? giaTu = null,
        [FromQuery] decimal? giaDen = null,
        [FromQuery] string sapXep = "uuTien",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var tuKhoaTimKiem = string.IsNullOrWhiteSpace(keyword) ? tuKhoa : keyword;
        var ketQua = await _baiDangService.TimKiemAsync(
            idDanhMuc,
            idThanhPho,
            idPhuongXa,
            tuKhoaTimKiem,
            giaTu,
            giaDen,
            sapXep,
            page,
            pageSize);

        if (User.Identity?.IsAuthenticated == true && !string.IsNullOrWhiteSpace(tuKhoaTimKiem))
            await _timKiemService.GhiLaiAsync(GetUserId(), tuKhoaTimKiem);

        return Ok(ketQua);
    }

    [HasPermission(AppPermissions.BaiDangDuyet)]
    [HttpGet("cho-duyet")]
    public async Task<IActionResult> DanhSachChoDuyet(
        [FromQuery] string? keyword,
        [FromQuery] int? idDanhMuc,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var ketQua = await _baiDangService.DanhSachChoDuyetAsync(keyword, idDanhMuc, page, pageSize);
        return Ok(ketQua);
    }

    [Authorize]
    [HttpGet("cua-toi")]
    public async Task<IActionResult> DanhSachCuaToi(
        [FromQuery] TrangThaiBaiDang? trangThai,
        [FromQuery] string? keyword,
        [FromQuery] int? idDanhMuc,
        [FromQuery] string sapXep = "moiNhat",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var ketQua = await _baiDangService.DanhSachCuaToiAsync(
            GetUserId(), trangThai, keyword, idDanhMuc, sapXep, page, pageSize);
        return Ok(ketQua);
    }

    [Authorize]
    [HttpGet("cua-toi/thong-ke")]
    public async Task<IActionResult> ThongKeCuaToi()
    {
        return Ok(await _baiDangService.ThongKeCuaToiAsync(GetUserId()));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetChiTiet(int id)
    {
        int? idNguoiXem = User.Identity?.IsAuthenticated == true ? GetUserId() : null;
        return Ok(await _baiDangService.GetChiTietAsync(id, idNguoiXem, User.HasClaim(AppPermissions.ClaimType, AppPermissions.BaiDangDuyet)));
    }

    [HasPermission(AppPermissions.BaiDangTao)]
    [HttpPost]
    public async Task<IActionResult> Tao(TaoBaiDangRequest request)
    {
        var ketQua = await _baiDangService.TaoAsync(GetUserId(), request);
        return CreatedAtAction(nameof(GetChiTiet), new { id = ketQua.Id }, ketQua);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> CapNhat(int id, TaoBaiDangRequest request)
    {
        var ketQua = await _baiDangService.CapNhatAsync(id, GetUserId(), request);
        return Ok(ketQua);
    }

    [Authorize]
    [HttpPut("{id:int}/an")]
    public async Task<IActionResult> An(int id)
    {
        await _baiDangService.AnAsync(id, GetUserId());
        return NoContent();
    }

    [Authorize]
    [HttpPut("{id:int}/hien")]
    public async Task<IActionResult> Hien(int id)
    {
        await _baiDangService.HienAsync(id, GetUserId());
        return NoContent();
    }

    [Authorize]
    [HttpPut("{id:int}/da-ban")]
    public async Task<IActionResult> DaBan(int id)
    {
        await _baiDangService.DaBanAsync(id, GetUserId());
        return NoContent();
    }

    [Authorize]
    [HttpPost("{id:int}/day-tin")]
    public async Task<IActionResult> DayTin(int id)
    {
        await _baiDangService.DayTinAsync(id, GetUserId());
        return NoContent();
    }

    [Authorize]
    [HttpPost("{id:int}/gia-han")]
    public async Task<IActionResult> GiaHan(int id)
    {
        await _baiDangService.GiaHanAsync(id, GetUserId());
        return NoContent();
    }

    [Authorize]
    [HttpPut("{id:int}/huy-dang")]
    public async Task<IActionResult> HuyDang(int id)
    {
        await _baiDangService.HuyDangAsync(id, GetUserId());
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Xoa(int id)
    {
        await _baiDangService.XoaAsync(id, GetUserId());
        return NoContent();
    }

    [HasPermission(AppPermissions.BaiDangTao)]
    [HttpPost("tep")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(51L * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 51L * 1024 * 1024)]
    public async Task<IActionResult> UploadTep(
        IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Vui lòng chọn ảnh hoặc video." });

        var extension = Path.GetExtension(file.FileName);
        var contentType = file.ContentType.Split(';', 2)[0].Trim();
        var isImage = extension.ToLowerInvariant() switch
        {
            ".jpg" => contentType.Equals("image/jpeg", StringComparison.OrdinalIgnoreCase),
            ".png" => contentType.Equals("image/png", StringComparison.OrdinalIgnoreCase),
            ".webp" => contentType.Equals("image/webp", StringComparison.OrdinalIgnoreCase),
            _ => false
        };
        var isVideo = extension.Equals(".mp4", StringComparison.OrdinalIgnoreCase)
            && contentType.Equals("video/mp4", StringComparison.OrdinalIgnoreCase);

        if (!isImage && !isVideo)
            return BadRequest(new { message = "Chỉ chấp nhận JPG, PNG, WebP hoặc MP4 với content-type phù hợp." });

        var maxFileSize = isVideo ? 50L * 1024 * 1024 : 5L * 1024 * 1024;
        if (file.Length > maxFileSize)
            return BadRequest(new { message = isVideo ? "Video không được vượt quá 50 MB." : "Ảnh không được vượt quá 5 MB." });

        await using var stream = file.OpenReadStream();
        var duongDan = await _fileStorage.SaveAsync(stream, extension, cancellationToken);
        return Ok(new { duongDan });
    }

    [HasPermission(AppPermissions.BaiDangDuyet)]
    [HttpPut("{id:int}/duyet")]
    public async Task<IActionResult> Duyet(int id)
    {
        await _baiDangService.DuyetAsync(id);
        return NoContent();
    }

    [HasPermission(AppPermissions.BaiDangDuyet)]
    [HttpPut("{id:int}/tu-choi")]
    public async Task<IActionResult> TuChoi(int id, [FromBody] TuChoiBaiDangRequest request)
    {
        await _baiDangService.TuChoiAsync(id, request.LyDo);
        return NoContent();
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}