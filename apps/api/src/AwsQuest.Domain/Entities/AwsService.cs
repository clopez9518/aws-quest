namespace AwsQuest.Domain.Entities;

using AwsQuest.Domain.Enums;

public class AwsService
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ResourceKind Kind { get; set; } = ResourceKind.ManagedService;
    public PlacementScope PlacementScope { get; set; } = PlacementScope.RegionalGlobal;
    public string? DefaultConfigJson { get; set; }

    public ICollection<ChallengeService> ChallengeServices { get; set; } = new List<ChallengeService>();
}
