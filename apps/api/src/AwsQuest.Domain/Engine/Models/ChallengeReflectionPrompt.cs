namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class ChallengeReflectionPrompt
{
    public string Question { get; set; } = string.Empty;
    public WellArchitectedPillar Pillar { get; set; } = WellArchitectedPillar.Reliability;
    public int BonusXP { get; set; } = 25;
    public List<ReflectionOption> Options { get; set; } = [];
}

public class ReflectionOption
{
    public string Id { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string Explanation { get; set; } = string.Empty;
}
