namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class RoutingRule
{
    public SubnetTier SubnetTier { get; set; } = SubnetTier.Public;
    public string? RequiresRouteTo { get; set; }
    public string? ForbiddenRouteTo { get; set; }
    public int PenaltyIfMissing { get; set; } = 20;
    public string? Description { get; set; }
}
