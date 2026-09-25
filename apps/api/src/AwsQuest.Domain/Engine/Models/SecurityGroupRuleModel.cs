namespace AwsQuest.Domain.Engine.Models;

public class SecurityGroupRuleModel
{
    public string TargetServiceCode { get; set; } = string.Empty;
    public string AllowedSourceServiceCode { get; set; } = string.Empty;
    public string Protocol { get; set; } = "TCP";
    public int Port { get; set; } = 5432;
    public bool ProhibitPublicAccess { get; set; } = true;
    public int PenaltyIfViolated { get; set; } = 20;
    public string? Description { get; set; }
}
