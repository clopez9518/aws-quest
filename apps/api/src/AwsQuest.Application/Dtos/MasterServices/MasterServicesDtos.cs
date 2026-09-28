namespace AwsQuest.Application.Dtos.MasterServices;

using AwsQuest.Domain.Enums;

public class AwsServiceResponseDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string ShortDescription { get; init; } = string.Empty;
    public string IconUrl { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public ResourceKind Kind { get; init; }
    public PlacementScope PlacementScope { get; init; }
    public string? DefaultConfigJson { get; init; }
    public string DictionarySlug { get; init; } = string.Empty;
}
