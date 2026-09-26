namespace AwsQuest.Domain.Engine.Models;

public class ChallengeBriefing
{
    public string KeyConcept { get; set; } = string.Empty;
    public string BusinessScenario { get; set; } = string.Empty;
    public string LearningObjective { get; set; } = string.Empty;
    public List<string> KeyTakeaways { get; set; } = [];
    public List<BriefingKeyComponent> KeyComponents { get; set; } = [];
    public string EstimatedReadTime { get; set; } = "30 seg";
}

public class BriefingKeyComponent
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ServiceCode { get; set; }
    public string? Category { get; set; }
    public string? Slug { get; set; }
}

