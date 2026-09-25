namespace AwsQuest.Domain.Entities;

using AwsQuest.Domain.Enums;

public class SystemConfig
{
    public string Id { get; set; } = "global_config";
    public AccessMode AccessMode { get; set; } = AccessMode.OpenAccess;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
