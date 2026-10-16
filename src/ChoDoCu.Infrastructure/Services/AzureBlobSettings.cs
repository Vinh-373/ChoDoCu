
namespace ChoDoCu.Infrastructure.Services;

public sealed class AzureBlobSettings
{
    public string ConnectionString { get; set; } = string.Empty;

    public string ContainerName { get; set; } = "chodocu-images";
}
