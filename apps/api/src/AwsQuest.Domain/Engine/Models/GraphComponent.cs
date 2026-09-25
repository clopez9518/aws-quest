namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class GraphComponent
{
    public string Id { get; set; } = string.Empty;
    public string ServiceCode { get; set; } = string.Empty;
    public string? Label { get; set; }
    public string? ParentId { get; set; }
    public ResourceKind? Kind { get; set; }
    public ResourceCategory? Category { get; set; }
    public ComponentConfig Config { get; set; } = new();

    public override string ToString() => $"{ServiceCode} ({Id}) [Parent: {ParentId ?? "none"}]";
}
