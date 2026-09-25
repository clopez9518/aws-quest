namespace AwsQuest.Domain.Engine.Models;

public class RouteEntry
{
    public string DestinationCidr { get; set; } = "0.0.0.0/0";
    public string TargetId { get; set; } = string.Empty;
    public string? Description { get; set; }

    public override string ToString() => $"{DestinationCidr} -> {TargetId}";
}
