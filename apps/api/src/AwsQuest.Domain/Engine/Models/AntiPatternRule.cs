namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class AntiPatternRule
{
    public string Code { get; set; } = string.Empty;
    public AntiPatternType Type { get; set; } = AntiPatternType.SinglePointOfFailure;
    public string Condition { get; set; } = string.Empty;
    public int Penalty { get; set; } = 20;
    public FeedbackCategory Category { get; set; } = FeedbackCategory.Availability;
    public string Title { get; set; } = string.Empty;
    public string Feedback { get; set; } = string.Empty;
}
