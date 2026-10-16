
using ChoDoCu.Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;

namespace ChoDoCu.Infrastructure.Services;

public sealed class LocalImageStorageService : IImageStorageService
{
    private readonly IWebHostEnvironment _environment;

    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
        };

    private static readonly HashSet<string> AllowedContentTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg", "image/png", "image/webp", "image/gif"
        };

    public LocalImageStorageService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> SaveAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder = "posts",
        CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(fileName);

        if (!AllowedExtensions.Contains(extension) ||
            !AllowedContentTypes.Contains(contentType))
        {
            throw new ArgumentException(
                "Định dạng ảnh không được hỗ trợ.");
        }

        var webRoot = _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");
        }

        var allowedFolders = new[]
{
    "posts", "avatars", "banners", "categories"
};

        if (!allowedFolders.Contains(folder, StringComparer.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Thư mục ảnh không hợp lệ.");
        }

        var uploadFolder = Path.Combine(
            webRoot, "uploads", "images", folder);

        Directory.CreateDirectory(uploadFolder);

        var newFileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var filePath = Path.Combine(uploadFolder, newFileName);

        await using (var output = new FileStream(
            filePath,
            FileMode.CreateNew,
            FileAccess.Write,
            FileShare.None))
        {
            await fileStream.CopyToAsync(output, cancellationToken);
        }

        return $"/uploads/images/{folder}/{newFileName}";
    }


    public Task DeleteAsync(
        string imageUrl,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return Task.CompletedTask;

        const string prefix = "/uploads/images/";

        if (!imageUrl.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            return Task.CompletedTask;

        var relativePath = imageUrl[prefix.Length..];

        if (Path.IsPathRooted(relativePath) ||
            relativePath.Split('/', '\\').Any(
                part => part is "." or ".."))
        {
            return Task.CompletedTask;
        }

        var webRoot = _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(webRoot))
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");

        var root = Path.GetFullPath(
            Path.Combine(webRoot, "uploads", "images"));

        var fullPath = Path.GetFullPath(
            Path.Combine(root, relativePath));

        if (!fullPath.StartsWith(
            root + Path.DirectorySeparatorChar,
            StringComparison.OrdinalIgnoreCase))
        {
            return Task.CompletedTask;
        }

        if (System.IO.File.Exists(fullPath))
            System.IO.File.Delete(fullPath);

        return Task.CompletedTask;
    }

}
