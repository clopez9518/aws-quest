namespace AwsQuest.Domain.Engine.Models;

public class RequiredConnectionRule
{
    public string FromServiceCode { get; set; } = string.Empty;
    public string ToServiceCode { get; set; } = string.Empty;
    public string? ConnectionType { get; set; }
    public bool IsBidirectional { get; set; } = false;
    public int PenaltyIfMissing { get; set; } = 15;
    public string Description { get; set; } = string.Empty;
}
