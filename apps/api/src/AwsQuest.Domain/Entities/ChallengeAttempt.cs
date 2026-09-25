namespace AwsQuest.Domain.Entities;

public class ChallengeAttempt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProgressId { get; set; }
    public int Score { get; set; }
    public bool Passed { get; set; }
    public int HintsUsed { get; set; } = 0;
    public string GraphSubmittedJson { get; set; } = "{}";
    public string EvaluationResultJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public UserProgress Progress { get; set; } = null!;
}
