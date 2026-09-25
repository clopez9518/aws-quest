namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class PlacementRule
{
    public string ServiceCode { get; set; } = string.Empty;
    public string RequiredContainerCode { get; set; } = "NET_SUBNET";
    public SubnetTier? RequiredSubnetTier { get; set; }
    public int PenaltyIfViolated { get; set; } = 25;
    public string? Description { get; set; }
}
