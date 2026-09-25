namespace AwsQuest.Domain.Engine.Models;

public class ForbiddenConnectionRule
{
    public string FromServiceCode { get; set; } = string.Empty;
    public string ToServiceCode { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public int Penalty { get; set; } = 20;
}
