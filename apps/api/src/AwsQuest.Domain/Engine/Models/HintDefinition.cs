namespace AwsQuest.Domain.Engine.Models;

public class HintDefinition
{
    public int OrderIndex { get; set; }
    public string Text { get; set; } = string.Empty;
    public int PenaltyPoints { get; set; }
}
