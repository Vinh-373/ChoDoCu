
using ChoDoCu.Application.Common.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace ChoDoCu.Infrastructure.Services;

public sealed class CloudinaryImageStorageService : IImageStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryImageStorageService(
        IOptions<CloudinarySettings> options)
    {
        var settings = options.Value;

        if (string.IsNullOrWhiteSpace(settings.CloudName) ||
            string.IsNullOrWhiteSpace(settings.ApiKey) ||
            string.IsNullOrWhiteSpace(settings.ApiSecret))
        {
            throw new InvalidOperationException(
                "Thiếu cấu hình Cloudinary.");
        }

        var account = new Account(
            settings.CloudName,
            settings.ApiKey,
            settings.ApiSecret);

        _cloudinary = new Cloudinary(account);
    }


    public async Task<string> SaveAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder = "posts",
        CancellationToken cancellationToken = default)

    {
        if (fileStream == null || !fileStream.CanRead)
            throw new ArgumentException("File ảnh không hợp lệ.");

        if (!contentType.StartsWith(
                "image/", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Tệp tải lên phải là ảnh.");

        var extension = Path.GetExtension(fileName).ToLowerInvariant();

        var allowedExtensions = new[]
        {
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
        };

        if (!allowedExtensions.Contains(extension))
            throw new ArgumentException("Định dạng ảnh không được hỗ trợ.");

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = $"chodocu/{folder}"
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null || result.SecureUrl == null)
        {
            throw new InvalidOperationException(
                $"Upload Cloudinary thất bại: {result.Error?.Message}");
        }

        return result.SecureUrl.ToString();
    }

    public async Task DeleteAsync(
        string imageUrl,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return;

        if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) ||
            !uri.Host.EndsWith(
                "cloudinary.com", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var segments = uri.AbsolutePath
            .Split('/', StringSplitOptions.RemoveEmptyEntries);

        var uploadIndex = Array.IndexOf(segments, "upload");

        if (uploadIndex < 0 || uploadIndex + 1 >= segments.Length)
            return;

        var start = uploadIndex + 1;

        // Bỏ phiên bản dạng v123456 nếu có.
        if (start < segments.Length &&
            System.Text.RegularExpressions.Regex.IsMatch(
                segments[start], @"^v\d+$"))
        {
            start++;
        }

        if (start >= segments.Length)
            return;

        var publicIdParts = segments.Skip(start).ToArray();
        publicIdParts[^1] = Path.GetFileNameWithoutExtension(
            publicIdParts[^1]);

        var publicId = string.Join("/", publicIdParts);

        var deleteParams = new DeletionParams(publicId)
        {
            ResourceType = ResourceType.Image
        };

        var result = await _cloudinary.DestroyAsync(deleteParams);

        if (result.Error != null)
        {
            throw new InvalidOperationException(
                $"Xóa ảnh Cloudinary thất bại: {result.Error.Message}");
        }
    }
}
