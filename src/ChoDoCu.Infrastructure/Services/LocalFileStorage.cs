using ChoDoCu.Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;

namespace ChoDoCu.Infrastructure.Services;

public sealed class LocalFileStorage : IFileStorage
{
    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".png", ".webp", ".mp4" };

    private readonly IWebHostEnvironment _environment;

    public LocalFileStorage(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> SaveAsync(
        Stream fileStream,
        string extension,
        CancellationToken cancellationToken = default)
    {
        if (!AllowedExtensions.Contains(extension))
            throw new ArgumentException("Định dạng tệp không được hỗ trợ.", nameof(extension));

        var webRoot = string.IsNullOrWhiteSpace(_environment.WebRootPath)
            ? Path.Combine(_environment.ContentRootPath, "wwwroot")
            : _environment.WebRootPath;
        var uploadFolder = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploadFolder);

        var fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var filePath = Path.Combine(uploadFolder, fileName);

        await using var output = new FileStream(
            filePath,
            FileMode.CreateNew,
            FileAccess.Write,
            FileShare.None);
        await fileStream.CopyToAsync(output, cancellationToken);

        return $"/uploads/{fileName}";
    }

    public Task DeleteAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        const string prefix = "/uploads/";
        if (string.IsNullOrWhiteSpace(filePath)
            || !filePath.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return Task.CompletedTask;
        }

        var relativePath = filePath[prefix.Length..];
        if (Path.IsPathRooted(relativePath)
            || relativePath.Split('/', '\\').Any(part => part is "." or ".."))
        {
            throw new ArgumentException("Đường dẫn tệp không hợp lệ.", nameof(filePath));
        }

        var webRoot = string.IsNullOrWhiteSpace(_environment.WebRootPath)
            ? Path.Combine(_environment.ContentRootPath, "wwwroot")
            : _environment.WebRootPath;
        var uploadRoot = Path.GetFullPath(Path.Combine(webRoot, "uploads"));
        var fullPath = Path.GetFullPath(Path.Combine(uploadRoot, relativePath));
        if (!fullPath.StartsWith(
                uploadRoot + Path.DirectorySeparatorChar,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Đường dẫn tệp không hợp lệ.", nameof(filePath));
        }

        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }
}
