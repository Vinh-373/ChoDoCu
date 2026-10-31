namespace ChoDoCu.Application.Common.Interfaces;

public interface IFileStorage
{
    Task<string> SaveAsync(
        Stream fileStream,
        string extension,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        string filePath,
        CancellationToken cancellationToken = default);
}
