namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class SecurityGroupRule
{
    public RuleDirection Direction { get; set; } = RuleDirection.Ingress;
    public string Protocol { get; set; } = "TCP";
    public int? FromPort { get; set; }
    public int? ToPort { get; set; }
    public string Source { get; set; } = string.Empty;
    public string? Description { get; set; }

    public bool MatchesPort(int port)
    {
        if (string.Equals(Protocol, "ALL", StringComparison.OrdinalIgnoreCase)) return true;
        var from = FromPort ?? 0;
        var to = ToPort ?? FromPort ?? 65535;
        return port >= from && port <= to;
    }
}
