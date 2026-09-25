namespace AwsQuest.Domain.Engine.Models;

public class ChallengeBriefing
{
    public string KeyConcept { get; set; } = string.Empty;
    public string BusinessScenario { get; set; } = string.Empty;
    public string LearningObjective { get; set; } = string.Empty;
    public List<string> KeyTakeaways { get; set; } = [];
    public string EstimatedReadTime { get; set; } = "30 seg";
}
