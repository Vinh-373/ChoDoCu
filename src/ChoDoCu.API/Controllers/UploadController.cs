
using ChoDoCu.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChoDoCu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IImageStorageService _imageStorage;

    public UploadController(IImageStorageService imageStorage)
    {
        _imageStorage = imageStorage;
    }

    [HttpPost("image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage(
        IFormFile? file,
        [FromQuery] string type = "posts",
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new
            {
                message = "Vui lòng chọn ảnh."
            });
        }

        const long maxFileSize = 5 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            return BadRequest(new
            {
                message = "Ảnh không được vượt quá 5 MB."
            });
        }

        var allowedTypes = new[]
        {
            "posts", "avatars", "banners", "categories"
        };

        type = type.Trim().ToLowerInvariant();

        if (!allowedTypes.Contains(type))
        {
            return BadRequest(new
            {
                message = "Loại ảnh không hợp lệ. Hãy chọn posts, avatars, banners hoặc categories."
            });
        }

        try
        {
            await using var stream = file.OpenReadStream();

            var imageUrl = await _imageStorage.SaveAsync(
                stream,
                file.FileName,
                file.ContentType,
                type,
                cancellationToken);

            return Ok(new
            {
                message = "Upload ảnh thành công.",
                type,
                imageUrl,
                fileName = Path.GetFileName(imageUrl)
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
