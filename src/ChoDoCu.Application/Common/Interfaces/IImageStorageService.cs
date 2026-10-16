
namespace ChoDoCu.Application.Common.Interfaces;

public interface IImageStorageService
{
    Task<string> SaveAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder = "posts",
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        string imageUrl,
        CancellationToken cancellationToken = default);
}
