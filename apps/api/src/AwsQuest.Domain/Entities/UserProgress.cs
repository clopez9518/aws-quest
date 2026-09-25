namespace AwsQuest.Domain.Entities;

using AwsQuest.Domain.Enums;

public class UserProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid ChallengeId { get; set; }
    public ProgressStatus Status { get; set; } = ProgressStatus.NotStarted;
    public int HighScore { get; set; } = 0;
    public int HintsUsed { get; set; } = 0;
    public string? LastAttemptGraphJson { get; set; }
    public bool ReflectionCompleted { get; set; } = false;
    public string? ReflectionSelectedOptionId { get; set; }
    public DateTime? ReflectionAnsweredAt { get; set; }
    public DateTime? FirstCompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Challenge Challenge { get; set; } = null!;
    public ICollection<ChallengeAttempt> Attempts { get; set; } = new List<ChallengeAttempt>();
}
