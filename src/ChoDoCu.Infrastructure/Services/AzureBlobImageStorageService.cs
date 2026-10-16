
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ChoDoCu.Application.Common.Interfaces;
using Microsoft.Extensions.Options;

namespace ChoDoCu.Infrastructure.Services;

public sealed class AzureBlobImageStorageService : IImageStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly AzureBlobSettings _settings;

    private static readonly HashSet<string> AllowedFolders =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "posts",
            "avatars",
            "banners",
            "categories"
        };

    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
        };

    private static readonly HashSet<string> AllowedContentTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        };

    public AzureBlobImageStorageService(
        IOptions<AzureBlobSettings> options)
    {
        _settings = options.Value;

        if (string.IsNullOrWhiteSpace(_settings.ConnectionString))
        {
            throw new InvalidOperationException(
                "Chưa cấu hình Azure Blob Storage ConnectionString.");
        }

        _blobServiceClient = new BlobServiceClient(
            _settings.ConnectionString);
    }

    public async Task<string> SaveAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder = "posts",
        CancellationToken cancellationToken = default)
    {
        if (fileStream is null || !fileStream.CanRead)
        {
            throw new ArgumentException("File ảnh không hợp lệ.");
        }

        if (!AllowedFolders.Contains(folder))
        {
            throw new ArgumentException(
                "Loại ảnh không được hỗ trợ.");
        }

        if (!AllowedContentTypes.Contains(contentType))
        {
            throw new ArgumentException(
                "Content-Type của ảnh không được hỗ trợ.");
        }

        var extension = Path.GetExtension(fileName);

        if (!AllowedExtensions.Contains(extension))
        {
            throw new ArgumentException(
                "Định dạng ảnh không được hỗ trợ.");
        }

        var container = _blobServiceClient.GetBlobContainerClient(
            _settings.ContainerName);

        await container.CreateIfNotExistsAsync(
            cancellationToken: cancellationToken);

        var blobName =
            $"{folder}/{Guid.NewGuid():N}{extension.ToLowerInvariant()}";

        var blobClient = container.GetBlobClient(blobName);

        await blobClient.UploadAsync(
            fileStream,
            new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = contentType
                }
            },
            cancellationToken);

        return blobClient.Uri.ToString();
    }

    public async Task DeleteAsync(
        string imageUrl,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            return;
        }

        if (!Uri.TryCreate(
                imageUrl,
                UriKind.Absolute,
                out var uri) ||
            uri.Scheme != Uri.UriSchemeHttps)
        {
            return;
        }

        var serviceUri = new Uri(
            _blobServiceClient.Uri.GetLeftPart(UriPartial.Authority));

        if (!string.Equals(
                uri.Host,
                serviceUri.Host,
                StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var container = _blobServiceClient.GetBlobContainerClient(
            _settings.ContainerName);

        var containerPrefix =
            "/" + Uri.EscapeDataString(_settings.ContainerName) + "/";

        if (!uri.AbsolutePath.StartsWith(
                containerPrefix,
                StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var blobName = Uri.UnescapeDataString(
            uri.AbsolutePath[(containerPrefix.Length)..]);

        if (string.IsNullOrWhiteSpace(blobName))
        {
            return;
        }

        var blobClient = container.GetBlobClient(blobName);

        await blobClient.DeleteIfExistsAsync(
            DeleteSnapshotsOption.IncludeSnapshots,
            cancellationToken: cancellationToken);
    }
}
