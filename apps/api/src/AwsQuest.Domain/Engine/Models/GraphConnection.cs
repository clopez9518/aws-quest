namespace AwsQuest.Domain.Engine.Models;

public class GraphConnection
{
    public string FromComponentId { get; set; } = string.Empty;
    public string ToComponentId { get; set; } = string.Empty;
    public string ConnectionType { get; set; } = "HTTP_HTTPS";

    public override string ToString() => $"{FromComponentId} -> {ToComponentId} [{ConnectionType}]";
}
