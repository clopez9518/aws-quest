namespace AwsQuest.Domain.Entities;

using AwsQuest.Domain.Enums;

public class Challenge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UnitId { get; set; }
    public Guid? PrerequisiteChallengeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DifficultyLevel Difficulty { get; set; }
    public string Mode { get; set; } = "BUILDER";
    public int RequiredXP { get; set; } = 0;
    public string EvaluationRulesJson { get; set; } = "{}";
    public string HintsJson { get; set; } = "[]";
    public string? InitialGraphJson { get; set; }
    public string? BriefingJson { get; set; }
    public string? ReflectionPromptJson { get; set; }
    public int BaseXP { get; set; } = 100;
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Unit Unit { get; set; } = null!;
    public Challenge? Prerequisite { get; set; }
    public ICollection<Challenge> DependentChallenges { get; set; } = new List<Challenge>();
    public ICollection<ChallengeService> AllowedServices { get; set; } = new List<ChallengeService>();
    public ICollection<UserProgress> ProgressRecords { get; set; } = new List<UserProgress>();
}
